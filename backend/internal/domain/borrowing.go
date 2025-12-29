package domain

import (
	"context"
	"fmt"
	"time"

	"github.com/oklog/ulid/v2"
)

// 借りたイベント
type Borrowing struct {
	id        ulid.ULID
	name      string
	amount    *Amount
	eventDate time.Time
	createdAt time.Time
	updatedAt time.Time
}

func NewBorrowing(id ulid.ULID, name string, amount *Amount, eventDate time.Time, createdAt time.Time, updatedAt time.Time) (*Borrowing, error) {
	if len(name) < 1 {
		return nil, fmt.Errorf("イベント名は1文字以上である必要があります: %v", name)
	}

	if createdAt.After(updatedAt) {
		return nil, fmt.Errorf("作成日は更新日より前である必要があります: %v", updatedAt)
	}

	return &Borrowing{
		id:        id,
		name:      name,
		amount:    amount,
		eventDate: eventDate,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

func (b *Borrowing) ID() ulid.ULID {
	return b.id
}

func (b *Borrowing) Name() string {
	return b.name
}

func (b *Borrowing) Amount() *Amount {
	return b.amount
}

func (b *Borrowing) EventDate() time.Time {
	return b.eventDate
}

func (b *Borrowing) CreatedAt() time.Time {
	return b.createdAt
}

func (b *Borrowing) UpdatedAt() time.Time {
	return b.updatedAt
}

type BorrowingRepository interface {
	FindByGroupIDAndUserID(context.Context, ulid.ULID, string) ([]*Borrowing, error)
	FindByGroupIDAndUserIDAndEventID(context.Context, ulid.ULID, string, ulid.ULID) (*Borrowing, error)
}
