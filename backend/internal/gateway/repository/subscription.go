package repository

import (
	"context"
	"errors"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/jackc/pgx/v5"
	"go.opentelemetry.io/otel/codes"
)

// SubscriptionRepositoryImpl 通知購読リポジトリの実装
type SubscriptionRepositoryImpl struct {
	queries *postgres.Queries
}

// NewSubscriptionRepository SubscriptionRepositoryImplのファクトリ関数
func NewSubscriptionRepository(queries *postgres.Queries) *SubscriptionRepositoryImpl {
	return &SubscriptionRepositoryImpl{
		queries: queries,
	}
}

// FindByUserIDAndChannel ユーザーIDとチャネルで通知購読を取得する
func (sr *SubscriptionRepositoryImpl) FindByUserIDAndChannel(ctx context.Context, userID string, channel domain.NotificationChannel) (*domain.Subscription, error) {
	ctx, span := tracer.Start(ctx, "subscription.FindByUserIDAndChannel")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM subscriptions WHERE user_id = $1 AND channel = $2 LIMIT 1")
	row, err := sr.queries.FindSubscriptionByUserIDAndChannel(ctx, postgres.FindSubscriptionByUserIDAndChannelParams{
		UserID:  userID,
		Channel: string(channel),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.NewNotFoundError("subscription", userID)
		}
		return nil, err
	}
	querySpan.End()

	subscription, err := domain.NewSubscription(ctx, row.UserID, domain.NotificationChannel(row.Channel), row.EventFiring, row.WeeklySummary)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return subscription, nil
}

// FindByUserID ユーザーIDで通知購読一覧を取得する
func (sr *SubscriptionRepositoryImpl) FindByUserID(ctx context.Context, userID string) ([]*domain.Subscription, error) {
	ctx, span := tracer.Start(ctx, "subscription.FindByUserID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM subscriptions WHERE user_id = $1")
	rows, err := sr.queries.FindSubscriptionsByUserID(ctx, userID)
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	subscriptions := make([]*domain.Subscription, 0, len(rows))
	for _, row := range rows {
		subscription, err := domain.NewSubscription(ctx, row.UserID, domain.NotificationChannel(row.Channel), row.EventFiring, row.WeeklySummary)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		subscriptions = append(subscriptions, subscription)
	}

	return subscriptions, nil
}

// Upsert 通知購読を作成または更新する
func (sr *SubscriptionRepositoryImpl) Upsert(ctx context.Context, s *domain.Subscription) error {
	ctx, span := tracer.Start(ctx, "subscription.Upsert")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "INSERT INTO subscriptions ... ON CONFLICT DO UPDATE")
	err := sr.queries.UpsertSubscription(ctx, postgres.UpsertSubscriptionParams{
		UserID:        s.UserID(),
		Channel:       string(s.Channel()),
		EventFiring:   s.EventFiring(),
		WeeklySummary: s.WeeklySummary(),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}

// Delete 通知購読を削除する
func (sr *SubscriptionRepositoryImpl) Delete(ctx context.Context, userID string, channel domain.NotificationChannel) error {
	ctx, span := tracer.Start(ctx, "subscription.Delete")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "DELETE FROM subscriptions WHERE user_id = $1 AND channel = $2")
	err := sr.queries.DeleteSubscription(ctx, postgres.DeleteSubscriptionParams{
		UserID:  userID,
		Channel: string(channel),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}
