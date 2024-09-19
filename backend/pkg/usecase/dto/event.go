package dto

import (
	"time"
)

type EventCreate struct {
	Name      string
	EventedAt time.Time
	CreatedBy string
	PaidBy    string
	Amount    int
	Payments  []struct {
		PaidTo string
		Amount int
	}
	GroupId string
}

type EventUpdate struct {
	Name      string
	EventedAt time.Time
	CreatedBy string
	PaidBy    string
	Amount    int
	Payments  []struct {
		PaymentID string
		PaidTo    string
		Amount    int
	}
	GroupId string
}

type EventResponse struct {
	ID        string
	Name      string
	EventedAt time.Time
	CreatedBy string
	PaidBy    string
	Amount    int
	Paymetns  []struct {
		PaymentId string
		PaidTo    string
		Amount    int
	}
	GroupId string
}

type Events struct {
	Events []struct {
		ID        string
		Name      string
		EventedAt time.Time
		PaidBy    struct {
			ID   string
			Name string
		}
		Amount int
	}
}
