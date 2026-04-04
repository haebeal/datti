package domain

import (
	"context"

	"go.opentelemetry.io/otel/codes"
)

// NotificationChannel 通知チャネルを表す値オブジェクト
type NotificationChannel string

const (
	// NotificationChannelLINE LINE通知チャネル
	NotificationChannelLINE NotificationChannel = "line"
)

// Valid 通知チャネルが有効かどうかを判定する
func (c NotificationChannel) Valid() bool {
	switch c {
	case NotificationChannelLINE:
		return true
	default:
		return false
	}
}

// Subscription 通知購読を表すドメインエンティティ
type Subscription struct {
	eventFiring   bool
	weeklySummary bool
}

// NewSubscription Subscriptionドメインエンティティのファクトリ関数
func NewSubscription(ctx context.Context, eventFiring bool, weeklySummary bool) (s *Subscription, err error) {
	_, span := tracer.Start(ctx, "domain.Subscription.New")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	return &Subscription{
		eventFiring:   eventFiring,
		weeklySummary: weeklySummary,
	}, nil
}

// EventFiring イベント発生通知が有効かどうか
func (s *Subscription) EventFiring() bool {
	return s.eventFiring
}

// WeeklySummary 週次サマリー通知が有効かどうか
func (s *Subscription) WeeklySummary() bool {
	return s.weeklySummary
}

// SubscriptionRepository 通知購読リポジトリのインターフェース
type SubscriptionRepository interface {
	// FindByUserIDAndChannel ユーザーIDとチャネルで通知購読を取得する
	FindByUserIDAndChannel(ctx context.Context, userID string, channel NotificationChannel) (*Subscription, error)
	// FindByUserID ユーザーIDで通知購読一覧を取得する
	FindByUserID(ctx context.Context, userID string) ([]*Subscription, error)
	// Upsert 通知購読を作成または更新する
	Upsert(ctx context.Context, userID string, channel NotificationChannel, s *Subscription) error
	// Delete 通知購読を削除する
	Delete(ctx context.Context, userID string, channel NotificationChannel) error
}
