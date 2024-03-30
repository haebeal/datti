package response

import (
	"time"

	"github.com/datti-api/pkg/domain/model"
)

type Event struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	EventedAt time.Time `json:"evented_at"`
	Uid       string    `json:"uid"`
	GroupId   string    `json:"group_id"`
}

type Events struct {
	Events []*model.Event `json:"events"`
}
