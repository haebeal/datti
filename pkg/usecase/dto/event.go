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
	Payments  []PaymentUsers
	GroupId   string
}

type PaymentUsers struct {
	User   string
	Amount int
}

type EventCreateResponse struct {
	ID        string
	Name      string
	EventedAt time.Time
	CreatedBy string
	Amount    int
	Paymetns  []Payment
	GroupId   string
}

type Payment struct {
	ID     string
	Name   string
	Amount int
}
