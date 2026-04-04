package usecase

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

// SubscriptionUseCaseImpl 通知購読に関するユースケースの実装
type SubscriptionUseCaseImpl struct {
	sr domain.SubscriptionRepository
}

// NewSubscriptionUseCase SubscriptionUseCaseImplのファクトリ関数
func NewSubscriptionUseCase(sr domain.SubscriptionRepository) SubscriptionUseCaseImpl {
	return SubscriptionUseCaseImpl{
		sr: sr,
	}
}

// GetAll ユーザーの通知購読一覧を取得する
func (u SubscriptionUseCaseImpl) GetAll(ctx context.Context, input handler.SubscriptionGetAllInput) (output *handler.SubscriptionGetAllOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Subscription.GetAll")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	subscriptions, err := u.sr.FindByUserID(ctx, input.UID)
	if err != nil {
		return nil, err
	}

	return &handler.SubscriptionGetAllOutput{
		Subscriptions: subscriptions,
	}, nil
}

// Upsert 通知購読を作成または更新する
func (u SubscriptionUseCaseImpl) Upsert(ctx context.Context, input handler.SubscriptionUpsertInput) (output *handler.SubscriptionUpsertOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Subscription.Upsert")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	channel := domain.NotificationChannel(input.Channel)

	subscription, err := domain.NewSubscription(ctx, channel, input.EventFiring, input.WeeklySummary)
	if err != nil {
		return nil, err
	}

	if err := u.sr.Upsert(ctx, input.UID, subscription); err != nil {
		return nil, err
	}

	return &handler.SubscriptionUpsertOutput{
		Subscription: subscription,
	}, nil
}

// Delete 通知購読を削除する
func (u SubscriptionUseCaseImpl) Delete(ctx context.Context, input handler.SubscriptionDeleteInput) (err error) {
	ctx, span := tracer.Start(ctx, "usecase.Subscription.Delete")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	channel := domain.NotificationChannel(input.Channel)
	if !channel.Valid() {
		return domain.NewValidationError("channel", "無効な通知チャネルです")
	}

	return u.sr.Delete(ctx, input.UID, channel)
}
