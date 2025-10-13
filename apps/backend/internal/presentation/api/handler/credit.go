package handler

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
)

// CreditUseCase exposes read operations for credit summaries.
type CreditUseCase interface {
	List(ctx context.Context, input CreditListInput) (*CreditListOutput, error)
}

// CreditListInput carries parameters for listing credits from the perspective of the authenticated user.
type CreditListInput struct {
	UserID uuid.UUID
}

// CreditListOutput aggregates lending and borrowing credits for the caller.
type CreditListOutput struct {
	Lendings   []*domain.Credit
	Borrowings []*domain.Credit
}
