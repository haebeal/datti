package request

import (
	"time"

	"github.com/datti-api/pkg/usecase/dto"
)

type EventCreateRequest struct {
	Name      string    `json:"name"`
	EventedAt time.Time `json:"eventedAt"`
	CreatedBy string    `json:"createdBy"`
	PaidBy    string    `json:"paidBy"`
	Amount    int       `json:"amount"`
	Payments  []struct {
		PaidTo string `json:"paidTo"`
		Amount int    `json:"amount"`
	} `json:"payments"`
	GroupId string `json:"groupId"`
}

func ToEventCreate(req *EventCreateRequest) *dto.EventCreate {
	payments := make([]struct {
		PaidTo string
		Amount int
	}, len(req.Payments))

	for i, p := range req.Payments {
		payments[i] = struct {
			PaidTo string
			Amount int
		}{
			PaidTo: p.PaidTo,
			Amount: p.Amount,
		}
	}

	return &dto.EventCreate{
		Name:      req.Name,
		EventedAt: req.EventedAt,
		CreatedBy: req.CreatedBy,
		PaidBy:    req.PaidBy,
		Amount:    req.Amount,
		Payments:  payments,
		GroupId:   req.GroupId,
	}
}

type EventUpdateRequest struct {
	ID        string         `json:"eventId"`
	Name      string         `json:"name"`
	EventedAt time.Time      `json:"eventedAT"`
	CreatedBy string         `json:"createdBy"`
	PaidBy    string         `json:"paidBy"`
	Amount    int            `json:"amount"`
	Payments  []PaymentUsers `json:"payments"`
	GroupId   string         `json:"groupId"`
}

type PaymentUsers struct {
	ID     string `json:"paymentId,omitempty"`
	PaidTo string `json:"paidTo"`
	Amount int    `json:"amount"`
}
