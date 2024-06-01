package request

import (
	"time"

	"github.com/datti-api/pkg/usecase/dto"
)

type EventCreateRequest struct {
	Name      string         `json:"name"`
	EventedAt time.Time      `json:"evented_at"`
	CreatedBy string         `json:"created_by"`
	PaidBy    string         `json:"paid_by"`
	Amount    int            `json:"amount"`
	Payments  []PaymentUsers `json:"payments"`
	GroupId   string         `json:"group_id"`
}

type PaymentUsers struct {
	User   string `josn:"user"`
	Amount int    `json:"amount"`
}

func ToEventCreate(req *EventCreateRequest) *dto.EventCreate {
	payments := make([]dto.PaymentUsers, len(req.Payments))
	for i, p := range req.Payments {
		payments[i] = dto.PaymentUsers{
			User:   p.User,
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
