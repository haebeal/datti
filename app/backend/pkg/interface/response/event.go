package response

import (
	"time"

	"github.com/google/uuid"
)

type Event struct {
	ID        uuid.UUID `json:"eventId"`
	Name      string    `json:"name"`
	EventOn   time.Time `json:"eventOn"`
	CreatedBy uuid.UUID `json:"createdBy"`
	PaidBy    uuid.UUID `json:"paidBy"`
	Amount    int       `json:"amount"`
	Payments  []struct {
		PaymentId uuid.UUID `json:"paymentId"`
		PaidTo    uuid.UUID `json:"paidTo"`
		Amount    int       `json:"amount"`
	} `json:"payments"`
	GroupId uuid.UUID `json:"groupId"`
}

type Events struct {
	Events []struct {
		ID      uuid.UUID `json:"eventId"`
		Name    string    `json:"name"`
		EventOn time.Time `json:"eventOn"`
		PaidBy  struct {
			ID   uuid.UUID `json:"userId"`
			Name string    `json:"name"`
		} `json:"paidBy"`
		Amount int `json:"amount"`
	} `json:"events"`
}
