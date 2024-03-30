package request

import "time"

type EventCreate struct {
	Name       string    `json:"name"`
	Evented_at time.Time `json:"evented_at"`
}
