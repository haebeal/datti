package domain

import (
	"time"

	"github.com/oklog/ulid/v2"
)

// 借りたイベント
type BorrowingEvent struct {
	id        ulid.ULID
	name      string
	eventDate time.Time
	createdAt time.Time
	updatedAt time.Time
}

// NewBorrowingEvent creates a new BorrowingEvent
func NewBorrowingEvent(id ulid.ULID, name string, eventDate time.Time) *BorrowingEvent {
	now := time.Now()
	return &BorrowingEvent{
		id:        id,
		name:      name,
		eventDate: eventDate,
		createdAt: now,
		updatedAt: now,
	}
}

// ID returns the ID of the borrowing event
func (be *BorrowingEvent) ID() ulid.ULID {
	return be.id
}

// Name returns the name of the borrowing event
func (be *BorrowingEvent) Name() string {
	return be.name
}

// EventDate returns the event date of the borrowing event
func (be *BorrowingEvent) EventDate() time.Time {
	return be.eventDate
}

// CreatedAt returns the creation time of the borrowing event
func (be *BorrowingEvent) CreatedAt() time.Time {
	return be.createdAt
}

// UpdatedAt returns the last update time of the borrowing event
func (be *BorrowingEvent) UpdatedAt() time.Time {
	return be.updatedAt
}

type BorrowingEventRepository interface {
	Create(*BorrowingEvent) error
}
