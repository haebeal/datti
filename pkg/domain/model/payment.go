package model

import "time"

type Payment struct {
	ID        string     `bun:"id,pk"`
	PaidBy    string     `bun:"paid_by,notnull"`
	PaidTo    string     `bun:"paid_to,notnull"`
	PaidAt    time.Time  `bun:"paid_at,nullzero,notnull"`
	Amount    int        `bun:"amount,notnull"`
	CreatedAt time.Time  `bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time  `bun:"updated_at,nullzero,notnull,default:current_timestamp"`
	DeletedAt *time.Time `bun:"deleted_at,soft_delete"`
}
