package usecase

import (
	"context"
	"fmt"
	"slices"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

type BorrowingUseCaseImpl struct {
	br domain.BorrowingRepository
	gmr domain.GroupMemberRepository
}

func NewBorrowingUseCase(br domain.BorrowingRepository, gmr domain.GroupMemberRepository) BorrowingUseCaseImpl {
	return BorrowingUseCaseImpl{
		br: br,
		gmr: gmr,
	}
}

func (u BorrowingUseCaseImpl) GetAll(ctx context.Context, i handler.GetAllBorrowingInput) (*handler.GetAllBorrowingOutput, error) {
	ctx, span := tracer.Start(ctx, "borrowing.GetAll")
	defer span.End()

	memberIDs, err := u.gmr.FindMembersByGroupID(ctx, i.GroupID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	if !slices.Contains(memberIDs, i.UserID) {
		return nil, fmt.Errorf("forbidden Error")
	}

	borrowings, err := u.br.FindByGroupIDAndUserID(ctx, i.GroupID, i.UserID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, fmt.Errorf("borrowingが存在しません")
	}

	return &handler.GetAllBorrowingOutput{
		Borrowings: borrowings,
	}, nil
}
