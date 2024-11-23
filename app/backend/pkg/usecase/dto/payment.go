package dto

import (
	"time"

	"github.com/google/uuid"
)

type Payments struct {
	Payments []struct {
		User struct {
			ID       uuid.UUID
			Name     string
			Email    string
			PhotoUrl string
		}
		Balance int
	}
}

type Payment struct {
	ID     string
	PaidAt time.Time
	PaidTo struct {
		ID       uuid.UUID
		Name     string
		Email    string
		PhotoUrl string
	}
	PaidBy struct {
		ID       uuid.UUID
		Name     string
		Email    string
		PhotoUrl string
	}
	Amount int
}

type PaymentCreate struct {
	PaidAt time.Time
	PaidTo uuid.UUID
	PaidBy uuid.UUID
	Amount int
}
