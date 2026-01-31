package domain

import (
	"context"
	"fmt"
)

// Credit represents an amount associated with another user.
// Whether it is lending or borrowing is determined by the caller (use case layer).
type Credit struct {
	userID string
	amount int64
}

func NewCredit(userID string, amount int64) (*Credit, error) {
	if userID == "" {
		return nil, fmt.Errorf("userID must not be empty")
	}
	if amount == 0 {
		return nil, fmt.Errorf("amount must not be zero")
	}

	return &Credit{
		userID: userID,
		amount: amount,
	}, nil
}

func (c *Credit) UserID() string {
	return c.userID
}

func (c *Credit) Amount() int64 {
	return c.amount
}

type CreditRepository interface {
	ListLendingCreditsByUserID(context.Context, string) ([]*Credit, error)
	ListBorrowingCreditsByUserID(context.Context, string) ([]*Credit, error)
}
