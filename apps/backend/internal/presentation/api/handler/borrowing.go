package handler

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
)

type BorrowingUseCase interface {
	GetAll(context.Context, GetAllBorrowingInput) (*GetAllBorrowingOutput, error)
}

type GetAllBorrowingInput struct {
	UserID uuid.UUID
}

type GetAllBorrowingOutput struct {
	Borrowings []*domain.Borrowing
}
