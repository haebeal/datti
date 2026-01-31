package domain

import (
	"context"
	"time"
	"unicode/utf8"

	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

// Lending 立て替えイベントエンティティ
type Lending struct {
	id        ulid.ULID
	name      string
	amount    int64
	eventDate time.Time
	createdAt time.Time
	updatedAt time.Time
}

// NewLending Lendingエンティティのファクトリ関数
func NewLending(ctx context.Context, id ulid.ULID, name string, amount int64, eventDate time.Time, createdAt time.Time, updatedAt time.Time) (l *Lending, err error) {
	_, span := tracer.Start(ctx, "domain.Lending.New")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	if utf8.RuneCountInString(name) < 1 {
		return nil, NewValidationError("name", "イベント名は1文字以上である必要があります")
	}

	if createdAt.After(updatedAt) {
		return nil, NewValidationError("updatedAt", "更新日は作成日より後である必要があります")
	}

	return &Lending{
		id:        id,
		name:      name,
		amount:    amount,
		eventDate: eventDate,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

// CreateLending 新規Lendingを作成するファクトリ関数
func CreateLending(ctx context.Context, name string, amount int64, eventDate time.Time) (*Lending, error) {
	id := ulid.Make()
	now := time.Now()

	return NewLending(ctx, id, name, amount, eventDate, now, now)
}

// Update Lendingを更新する
func (l *Lending) Update(ctx context.Context, name string, amount int64, eventDate time.Time) (*Lending, error) {
	now := time.Now()

	return NewLending(ctx, l.id, name, amount, eventDate, l.createdAt, now)
}

// ID イベントID
func (l *Lending) ID() ulid.ULID {
	return l.id
}

// Name イベント名
func (l *Lending) Name() string {
	return l.name
}

// Amount 金額
func (l *Lending) Amount() int64 {
	return l.amount
}

// EventDate イベント日
func (l *Lending) EventDate() time.Time {
	return l.eventDate
}

// CreatedAt 作成日時
func (l *Lending) CreatedAt() time.Time {
	return l.createdAt
}

// UpdatedAt 更新日時
func (l *Lending) UpdatedAt() time.Time {
	return l.updatedAt
}

// LendingPaginationParams ページネーションパラメータ
type LendingPaginationParams struct {
	Limit  int32
	Cursor *string
}

// PaginatedLendings ページネーション結果
type PaginatedLendings struct {
	Lendings   []*Lending
	NextCursor *string
	HasMore    bool
}

// LendingRepository 立て替えイベントリポジトリのインターフェース
type LendingRepository interface {
	Create(ctx context.Context, l *Lending) error
	FindByID(ctx context.Context, id ulid.ULID) (*Lending, error)
	FindByGroupIDAndUserID(ctx context.Context, groupID ulid.ULID, userID string, cursor *string, limit *int32) ([]*Lending, error)
	Update(ctx context.Context, l *Lending) error
	Delete(ctx context.Context, id ulid.ULID) error
}
