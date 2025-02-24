package model

import (
	"time"

	"github.com/google/uuid"
)

type Event struct {
	ID   uuid.UUID `bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name string    `bun:"name"`

	CreatedByUser *User     `bun:"rel:belongs-to,join:created_by=id"`
	CreatedBy     uuid.UUID `bun:"created_by,notnull,type:uuid"`

	PaidByUser *User     `bun:"rel:belongs-to,join:paid_by=id"`
	PaidBy     uuid.UUID `bun:"paid_by,notnull,type:uuid"`

	Amount int `bun:"amount,nullzero,notnull"`

	Group   *Group    `bun:"rel:belongs-to,join:group_id=id"`
	GroupId uuid.UUID `bun:"group_id,notnull,type:uuid,type:uuid"`

	EventOn   time.Time  `bun:"event_on,nullzero,notnull"`
	CreatedAt time.Time  `bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time  `bun:"updated_at,nullzero,notnull,default:current_timestamp"`
	DeletedAt *time.Time `bun:"deleted_at,soft_delete"`
}

type EventCreate struct {
	Name     string
	EventOn  time.Time
	PaidBy   string
	Amount   int
	Payments []PaymentUsers
}

type PaymentUsers struct {
	User   string
	Amount int
}
