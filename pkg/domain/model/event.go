package model

import "time"

type Event struct {
	ID        string     `bun:"id"`
	Name      string     `bun:"name"`
	CreatedBy string     `bun:"created_by"`
	GroupId   string     `bun:"group_id"`
	EventedAt time.Time  `bun:"evented_at, nullzero,notnull"`
	CreatedAt time.Time  `bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time  `bun:"updated_at,nullzero,notnull,default:current_timestamp"`
	DeletedAt *time.Time `bun:"deleted_at,soft_delete"`
}
