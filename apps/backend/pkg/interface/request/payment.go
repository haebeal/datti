package request

import (
	"time"

	"github.com/google/uuid"
)

type Create struct {
	PaidAt time.Time `json:"paidAt"`
	PaidTo uuid.UUID `json:"paidTo"`
	Amount int       `json:"amount"`
}

type Update struct {
	PaidAt time.Time `json:"paidAt"`
	PaidTo uuid.UUID `json:"paidTo"`
	PaidBy uuid.UUID `json:"paidBy"`
	Amount int       `json:"amount"`
}
