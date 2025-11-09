package usecase

import (
	"context"
	"fmt"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

type BorrowingUseCaseImpl struct {
	br domain.BorrwingRepository
}

func NewBorrowingUseCase(br domain.BorrwingRepository) BorrowingUseCaseImpl {
	return BorrowingUseCaseImpl{
		br: br,
	}
}

func (u BorrowingUseCaseImpl) GetAll(ctx context.Context, i handler.GetAllBorrowingInput) (*handler.GetAllBorrowingOutput, error) {
	ctx, span := tracer.Start(ctx, "borrowing.GetAll")
	defer span.End()

	borrowings, err := u.br.FindByUserID(ctx, i.UserID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, fmt.Errorf("borrowingが存在しません")
	}

	return &handler.GetAllBorrowingOutput{
		Borrowings: borrowings,
	}, nil
}
