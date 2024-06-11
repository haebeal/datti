package dto

import "time"

type Payments struct {
	Payments []struct {
		User struct {
			ID       string
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
		ID       string
		Name     string
		Email    string
		PhotoUrl string
	}
	PaidBy struct {
		ID       string
		Name     string
		Email    string
		PhotoUrl string
	}
	Amount int
}

type PaymentCreate struct {
	PaidAt time.Time
	PaidTo string
	PaidBy string
	Amount int
}
