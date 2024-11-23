package response

import (
	"time"

	"github.com/google/uuid"
)

type Payments struct {
	Payments []struct {
		User struct {
			ID       uuid.UUID `json:"userId"`
			Name     string    `json:"name"`
			Email    string    `json:"email"`
			PhotoUrl string    `json:"photoUrl"`
		} `json:"user"`
		Balance int `json:"amount"`
	} `json:"payments"`
}

type Payment struct {
	ID     uuid.UUID `json:"paymentId"`
	PaidAt time.Time `json:"paidAt"`
	PaidBy struct {
		ID       uuid.UUID `json:"userId"`
		Name     string    `json:"name"`
		Email    string    `json:"email"`
		PhotoUrl string    `json:"photoUrl"`
	} `json:"paidBy"`
	PaidTo struct {
		ID       uuid.UUID `json:"userId"`
		Name     string    `json:"name"`
		Email    string    `json:"email"`
		PhotoUrl string    `json:"photoUrl"`
	} `json:"paidTo"`
	Amount int `json:"amount"`
}

type PaymentList struct {
	Paymetns []Payment `json:"payments"`
}
