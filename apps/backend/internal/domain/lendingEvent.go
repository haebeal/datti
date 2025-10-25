package domain

import (
	"context"
	"fmt"
	"time"

	"github.com/oklog/ulid/v2"
)

// 貸したイベント
type LendingEvent struct {
	id        ulid.ULID
	name      string
	amount    *Amount
	eventDate time.Time
	createdAt time.Time
	updatedAt time.Time
}

func NewLendingEvent(id ulid.ULID, name string, amount *Amount, eventDate time.Time, createdAt time.Time, updatedAt time.Time) (*LendingEvent, error) {
	if len(name) < 1 {
		return nil, fmt.Errorf("イベント名は1文字以上である必要があります: %v", name)
	}

	if createdAt.After(updatedAt) {
		return nil, fmt.Errorf("作成日は更新日より前である必要があります: %v", updatedAt)
	}

	return &LendingEvent{
		id:        id,
		name:      name,
		amount:    amount,
		eventDate: eventDate,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

func CreateLendingEvent(name string, amount *Amount, eventDate time.Time) (*LendingEvent, error) {
	id := ulid.Make()
	now := time.Now()

	return NewLendingEvent(id, name, amount, eventDate, now, now)
}

func (le *LendingEvent) Update(name string, amount *Amount, eventDate time.Time) (*LendingEvent, error) {
	now := time.Now()

	return NewLendingEvent(le.id, name, amount, eventDate, le.createdAt, now)
}

// ID returns the ID of the lending event
func (le *LendingEvent) ID() ulid.ULID {
	return le.id
}

// Name returns the name of the lending event
func (le *LendingEvent) Name() string {
	return le.name
}

func (le *LendingEvent) Amount() *Amount {
	return le.amount
}

// EventDate returns the event date of the lending event
func (le *LendingEvent) EventDate() time.Time {
	return le.eventDate
}

// CreatedAt returns the creation time of the lending event
func (le *LendingEvent) CreatedAt() time.Time {
	return le.createdAt
}

// UpdatedAt returns the last update time of the lending event
func (le *LendingEvent) UpdatedAt() time.Time {
	return le.updatedAt
}

type LendingEventRepository interface {
	Create(context.Context, *LendingEvent) error
	FindByID(context.Context, ulid.ULID) (*LendingEvent, error)
	Update(context.Context, *LendingEvent) error
}
