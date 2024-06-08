package request

import (
	"time"

	"github.com/datti-api/pkg/usecase/dto"
)

type EventCreateRequest struct {
	Name      string    `json:"name"`
	EventedAt time.Time `json:"evented_at"`
	CreatedBy string    `json:"created_by"`
	PaidBy    string    `json:"paid_by"`
	Amount    int       `json:"amount"`
	Payments  []struct {
		PaidTo string `json:"paid_to"`
		Amount int    `json:"amount"`
	} `json:"payments"`
	GroupId string `json:"group_id"`
}

type PaymentUsers struct {
	ID     string `json:"payment_id"`
	PaidTo string `josn:"user"`
	Amount int    `json:"amount"`
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
	ID        string         `json:"id"`
	Name      string         `json:"name"`
	EventedAt time.Time      `json:"evented_at"`
	CreatedBy string         `json:"created_by"`
	PaidBy    string         `json:"paid_by"`
	Amount    int            `json:"amount"`
	Payments  []PaymentUsers `json:"payments"`
	GroupId   string         `json:"group_id"`
}
