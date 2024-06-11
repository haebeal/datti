package dto

import "time"

type PaymentCreate struct {
	PaidAt time.Time
	PaidTo string
	PaidBy string
	Amount int
}
