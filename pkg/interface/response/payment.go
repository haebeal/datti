package response

import "time"

type Payments struct {
	Payments []struct {
		User struct {
			ID       string `json:"uid"`
			Name     string `json:"name"`
			Email    string `json:"email"`
			PhotoUrl string `json:"photoUrl"`
		} `json:"user"`
		Balance int `json:"amount"`
	} `json:"payments"`
}

type Payment struct {
	ID     string    `json:"id"`
	PaidAt time.Time `json:"paid_at"`
	PaidBy struct {
		ID       string `json:"uid"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
	} `json:"paid_by"`
	PaidTo struct {
		ID       string `json:"uid"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
	} `json:"paid_to"`
	Amount int `json:"amount"`
}

type PaymentList struct {
	Paymetns []Payment `json:"payments"`
}
