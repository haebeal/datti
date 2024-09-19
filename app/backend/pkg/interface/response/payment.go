package response

import "time"

type Payments struct {
	Payments []struct {
		User struct {
			ID       string `json:"userId"`
			Name     string `json:"name"`
			Email    string `json:"email"`
			PhotoUrl string `json:"photoUrl"`
		} `json:"user"`
		Balance int `json:"amount"`
	} `json:"payments"`
}

type Payment struct {
	ID     string    `json:"paymentId"`
	PaidAt time.Time `json:"paidAt"`
	PaidBy struct {
		ID       string `json:"userId"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
	} `json:"paidBy"`
	PaidTo struct {
		ID       string `json:"userId"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
	} `json:"paidTo"`
	Amount int `json:"amount"`
}

type PaymentList struct {
	Paymetns []Payment `json:"payments"`
}
