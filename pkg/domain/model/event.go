package model

import "time"

type Event struct {
	ID        string     `bun:"id" json:"id"`
	Name      string     `bun:"name" json:"name"`
	CreatedBy string     `bun:"created_by" json:"created_by"`
	GroupId   string     `bun:"group_id" json:"group_id"`
	EventedAt time.Time  `bun:"evented_at, nullzero,notnull" json:"evented_at"`
	CreatedAt time.Time  `bun:"created_at,nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time  `bun:"updated_at,nullzero,notnull,default:current_timestamp" json:"updated_at"`
	DeletedAt *time.Time `bun:"deleted_at,soft_delete" json:"deleted_at"`
}
