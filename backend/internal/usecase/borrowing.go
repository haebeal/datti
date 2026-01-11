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
	br  domain.BorrowingRepository
	gmr domain.GroupMemberRepository
}

func NewBorrowingUseCase(br domain.BorrowingRepository, gmr domain.GroupMemberRepository) BorrowingUseCaseImpl {
	return BorrowingUseCaseImpl{
		br:  br,
		gmr: gmr,
	}
}

func (u BorrowingUseCaseImpl) Get(ctx context.Context, i handler.GetBorrowingInput) (*handler.GetBorrowingOutput, error) {
	ctx, span := tracer.Start(ctx, "borrowing.Get")
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

	borrowing, err := u.br.FindByGroupIDAndUserIDAndEventID(ctx, i.GroupID, i.UserID, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, fmt.Errorf("borrowingが存在しません")
	}

	return &handler.GetBorrowingOutput{
		Borrowing: borrowing,
	}, nil
}

func (u BorrowingUseCaseImpl) GetByQuery(ctx context.Context, i handler.GetAllBorrowingInput) (*handler.GetAllBorrowingOutput, error) {
	ctx, span := tracer.Start(ctx, "borrowing.GetByQuery")
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

	params := domain.BorrowingPaginationParams{
		Limit:  i.Limit,
		Cursor: i.Cursor,
	}

	paginatedBorrowings, err := u.br.FindByGroupIDAndUserIDWithPagination(ctx, i.GroupID, i.UserID, params)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, fmt.Errorf("borrowingが存在しません")
	}

	return &handler.GetAllBorrowingOutput{
		Borrowings: paginatedBorrowings.Borrowings,
		NextCursor: paginatedBorrowings.NextCursor,
		HasMore:    paginatedBorrowings.HasMore,
	}, nil
}
