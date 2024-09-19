package request

import "time"

type Create struct {
	PaidAt time.Time `json:"paidAt"`
	PaidTo string    `json:"paidTo"`
	Amount int       `json:"amount"`
}

type Update struct {
	PaidAt time.Time `json:"paidAt"`
	PaidTo string    `json:"paidTo"`
	PaidBy string    `json:"paidBy"`
	Amount int       `json:"amount"`
}
