package response

import (
	"time"
)

type Event struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	EventedAt time.Time `json:"evented_at"`
	CreatedBy string    `json:"created_by"`
	PaidBy    string    `json:"paid_by"`
	Amount    int       `json:"amount"`
	Payments  []struct {
		PaymentId string `json:"payment_id"`
		PaidTo    string `json:"paid_to"`
		Amount    int    `json:"amount"`
	} `json:"payments"`
	GroupId string `json:"group_id"`
}

type Events struct {
	Events []struct {
		ID        string    `json:"id"`
		Name      string    `json:"name"`
		EventedAt time.Time `json:"evented_at"`
		PaidBy    struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"paid_by"`
		Amount int `json:"amount"`
	} `json:"events"`
}
