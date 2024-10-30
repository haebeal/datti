package model

import (
	"time"

	"github.com/google/uuid"
)

type Payment struct {
	ID uuid.UUID `bun:"id,pk,type:uuid,default:gen_random_uuid()"`

	Event   *Event    `bun:"rel:belongs-to,join:event_id=id"`
	EventID uuid.UUID `bun:"event_id,nullzero,type:uuid"`

	PaidByUser *User     `bun:"rel:belongs-to,join:paid_by=id"`
	PaidBy     uuid.UUID `bun:"paid_by,notnull,type:uuid"`

	PaidToUser *User     `bun:"rel:belongs-to,join:paid_to=id"`
	PaidTo     uuid.UUID `bun:"paid_to,notnull,type:uuid"`

	PaidAt    time.Time  `bun:"paid_at,nullzero,notnull"`
	Amount    int        `bun:"amount,notnull"`
	CreatedAt time.Time  `bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time  `bun:"updated_at,nullzero,notnull,default:current_timestamp"`
	DeletedAt *time.Time `bun:"deleted_at,soft_delete"`
}

type PaymentResult struct {
	UserID         uuid.UUID
	CounterpartyID string
	Balance        int
}
