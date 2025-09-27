package domain

import (
	"time"

	"github.com/oklog/ulid/v2"
)

// 貸したイベント
type LendingEvent struct {
	id        ulid.ULID
	name      string
	eventDate time.Time
	createdAt time.Time
	updatedAt time.Time
}

// NewLendingEvent creates a new LendingEvent
func NewLendingEvent(id ulid.ULID, name string, eventDate time.Time) *LendingEvent {
	now := time.Now()
	return &LendingEvent{
		id:        id,
		name:      name,
		eventDate: eventDate,
		createdAt: now,
		updatedAt: now,
	}
}

// ID returns the ID of the lending event
func (le *LendingEvent) ID() ulid.ULID {
	return le.id
}

// Name returns the name of the lending event
func (le *LendingEvent) Name() string {
	return le.name
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
	Create(e *LendingEvent, p *Payer) error
}
