package domain

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// Credit represents the net balance between the authenticated user and another user.
// Positive amount means the other user owes the authenticated user, negative means the reverse.
type Credit struct {
	userID  uuid.UUID
	amount int64
}

func NewCredit(userID uuid.UUID, amount int64) (*Credit, error) {
	if userID == uuid.Nil {
		return nil, fmt.Errorf("userID must not be nil")
	}
	if amount == 0 {
		return nil, fmt.Errorf("amount must not be zero")
	}

	return &Credit{
		userID:  userID,
		amount:  amount,
	}, nil
}

func (c *Credit) UserID() uuid.UUID {
	return c.userID
}

func (c *Credit) Amount() int64 {
	return c.amount
}

func (c *Credit) IsCreditor() bool {
	return c.amount > 0
}

func (c *Credit) IsDebtor() bool {
	return c.amount < 0
}

type CreditRepository interface {
	ListByUserID(context.Context, uuid.UUID) ([]*Credit, error)
}
