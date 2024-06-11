package request

import "time"

type Create struct {
	PaidAt time.Time `json:"paid_at"`
	PaidTo string    `json:"paid_to"`
	Amount int       `json:"amount"`
}

type Update struct {
	PaidAt time.Time `json:"paid_at"`
	PaidTo string    `json:"paid_to"`
	PaidBy string    `json:"paid_by"`
	Amount int       `json:"amount"`
}
