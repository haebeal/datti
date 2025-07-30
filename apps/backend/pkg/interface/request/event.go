package request

import (
	"time"

	"github.com/google/uuid"
	"github.com/haebeal/datti/pkg/usecase/dto"
)

type EventCreateRequest struct {
	Name      string    `json:"name"`
	EventedAt time.Time `json:"eventedAt"`
	CreatedBy uuid.UUID `json:"createdBy"`
	PaidBy    uuid.UUID `json:"paidBy"`
	Amount    int       `json:"amount"`
	Payments  []struct {
		PaidTo uuid.UUID `json:"paidTo"`
		Amount int       `json:"amount"`
	} `json:"payments"`
	GroupId uuid.UUID `json:"groupId"`
}

func ToEventCreate(req *EventCreateRequest) *dto.EventCreate {
	payments := make([]struct {
		PaidTo uuid.UUID
		Amount int
	}, len(req.Payments))

	for i, p := range req.Payments {
		payments[i] = struct {
			PaidTo uuid.UUID
			Amount int
		}{
			PaidTo: p.PaidTo,
			Amount: p.Amount,
		}
	}

	return &dto.EventCreate{
		Name:      req.Name,
		EventOn:   req.EventedAt,
		CreatedBy: req.CreatedBy,
		PaidBy:    req.PaidBy,
		Amount:    req.Amount,
		Payments:  payments,
		GroupId:   req.GroupId,
	}
}

type EventUpdateRequest struct {
	ID        uuid.UUID      `json:"eventId"`
	Name      string         `json:"name"`
	EventedAt time.Time      `json:"eventedAT"`
	CreatedBy uuid.UUID      `json:"createdBy"`
	PaidBy    uuid.UUID      `json:"paidBy"`
	Amount    int            `json:"amount"`
	Payments  []PaymentUsers `json:"payments"`
	GroupId   uuid.UUID      `json:"groupId"`
}

type PaymentUsers struct {
	ID     uuid.UUID `json:"paymentId,omitempty"`
	PaidTo uuid.UUID `json:"paidTo"`
	Amount int       `json:"amount"`
}
