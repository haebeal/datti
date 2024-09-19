package response

import (
	"time"
)

type Event struct {
	ID        string    `json:"eventId"`
	Name      string    `json:"name"`
	EventedAt time.Time `json:"eventedAt"`
	CreatedBy string    `json:"createdBy"`
	PaidBy    string    `json:"paidBy"`
	Amount    int       `json:"amount"`
	Payments  []struct {
		PaymentId string `json:"paymentId"`
		PaidTo    string `json:"paidTo"`
		Amount    int    `json:"amount"`
	} `json:"payments"`
	GroupId string `json:"groupId"`
}

type Events struct {
	Events []struct {
		ID        string    `json:"eventId"`
		Name      string    `json:"name"`
		EventedAt time.Time `json:"eventedAt"`
		PaidBy    struct {
			ID   string `json:"userId"`
			Name string `json:"name"`
		} `json:"paidBy"`
		Amount int `json:"amount"`
	} `json:"events"`
}
