package model

import "time"

type Event struct {
	ID        string     `bun:"id"`
	Name      string     `bun:"name"`
	CreatedBy string     `bun:"created_by"`
	PaidBy    string     `bun:"paid_by,notnull"`
	Amount    int        `bun:"amount,nullzero,notnull"`
	GroupId   string     `bun:"group_id,nullzero"`
	EventedAt time.Time  `bun:"evented_at,nullzero,notnull"`
	CreatedAt time.Time  `bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time  `bun:"updated_at,nullzero,notnull,default:current_timestamp"`
	DeletedAt *time.Time `bun:"deleted_at,soft_delete"`
}

type EventCreate struct {
	Name      string
	EventedAt time.Time
	PaidBy    string
	Amount    int
	Payments  []PaymentUsers
}

type PaymentUsers struct {
	User   string
	Amount int
}
