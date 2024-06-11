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
	PaidTo struct {
		ID       string `json:"uid"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
	} `json:"paid_to"`
	PaidBy struct {
		ID       string `json:"uid"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		PhotoUrl string `json:"photoUrl"`
	} `json:"paid_by"`
	Amount int `json:"amount"`
}
