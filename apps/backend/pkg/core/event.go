package core

import (
	"time"

	"github.com/oklog/ulid/v2"
)

type Event struct {
	id        ulid.ULID
	name      string
	eventDate time.Time
	createdAt time.Time
	updatedAt time.Time
}

func NewEvent(id ulid.ULID, name string, eventDate time.Time, createdAt time.Time, updatedAt time.Time) (*Event, error) {
	return &Event{
		id:        id,
		name:      name,
		eventDate: eventDate,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

func CreateEvent(name string, eventDate time.Time) (*Event, error) {
	id := ulid.Make()

	now := time.Now()

	return NewEvent(id, name, eventDate, now, now)
}

func (e *Event) ID() ulid.ULID {
	return e.id
}

func (e *Event) Name() string {
	return e.name
}

func (e *Event) EventDate() time.Time {
	return e.eventDate
}

func (e *Event) CreatedAt() time.Time {
	return e.createdAt
}

func (e *Event) UpdatedAt() time.Time {
	return e.updatedAt
}
