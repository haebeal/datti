package dto

import (
	"time"

	"github.com/google/uuid"
)

type EventCreate struct {
	Name      string
	EventOn   time.Time
	CreatedBy uuid.UUID
	PaidBy    uuid.UUID
	Amount    int
	Payments  []struct {
		PaidTo uuid.UUID
		Amount int
	}
	GroupId uuid.UUID
}

type EventUpdate struct {
	Name      string
	EventOn   time.Time
	CreatedBy uuid.UUID
	PaidBy    uuid.UUID
	Amount    int
	Payments  []struct {
		PaymentID uuid.UUID
		PaidTo    uuid.UUID
		Amount    int
	}
	GroupId uuid.UUID
}

type EventResponse struct {
	ID        uuid.UUID
	Name      string
	EventOn   time.Time
	CreatedBy uuid.UUID
	PaidBy    uuid.UUID
	Amount    int
	Paymetns  []struct {
		PaymentId uuid.UUID
		PaidTo    uuid.UUID
		Amount    int
	}
	GroupId uuid.UUID
}

type Events struct {
	Events []struct {
		ID      uuid.UUID
		Name    string
		EventOn time.Time
		PaidBy  struct {
			ID   uuid.UUID
			Name string
		}
		Amount int
	}
}
