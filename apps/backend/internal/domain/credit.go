package domain

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// Credit represents an amount associated with another user.
// Whether it is lending or borrowing is determined by the caller (use case layer).
type Credit struct {
	userID uuid.UUID
	amount *Amount
}

func NewCredit(userID uuid.UUID, amount *Amount) (*Credit, error) {
	if userID == uuid.Nil {
		return nil, fmt.Errorf("userID must not be nil")
	}
	if amount == nil {
		return nil, fmt.Errorf("amount must not be nil")
	}
	if amount.Value() == 0 {
		return nil, fmt.Errorf("amount must not be zero")
	}

	return &Credit{
		userID: userID,
		amount: amount,
	}, nil
}

func (c *Credit) UserID() uuid.UUID {
	return c.userID
}

func (c *Credit) Amount() *Amount {
	return c.amount
}

type CreditRepository interface {
	ListLendingCreditsByUserID(context.Context, uuid.UUID) ([]*Credit, error)
	ListBorrowingCreditsByUserID(context.Context, uuid.UUID) ([]*Credit, error)
}
