package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"go.opentelemetry.io/otel/codes"
)

// CreditRepositoryImpl 債権/債務リポジトリの実装
type CreditRepositoryImpl struct {
	queries *postgres.Queries
}

// NewCreditRepository CreditRepositoryImplのファクトリ関数
func NewCreditRepository(queries *postgres.Queries) *CreditRepositoryImpl {
	return &CreditRepositoryImpl{
		queries: queries,
	}
}

// ListLendingsByUserID 自分が貸している一覧を取得
func (r *CreditRepositoryImpl) ListLendingsByUserID(ctx context.Context, userID string) (credits []*domain.Credit, err error) {
	ctx, span := tracer.Start(ctx, "repository.Credit.ListLendingsByUserID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	rows, err := r.queries.ListLendingCreditAmountsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	credits = make([]*domain.Credit, 0, len(rows))
	for _, row := range rows {
		credit, err := domain.NewCredit(row.UserID, row.Amount)
		if err != nil {
			return nil, err
		}
		credits = append(credits, credit)
	}

	return credits, nil
}

// ListBorrowingsByUserID 自分が借りている一覧を取得
func (r *CreditRepositoryImpl) ListBorrowingsByUserID(ctx context.Context, userID string) (credits []*domain.Credit, err error) {
	ctx, span := tracer.Start(ctx, "repository.Credit.ListBorrowingsByUserID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	rows, err := r.queries.ListBorrowingCreditAmountsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	credits = make([]*domain.Credit, 0, len(rows))
	for _, row := range rows {
		credit, err := domain.NewCredit(row.UserID, row.Amount)
		if err != nil {
			return nil, err
		}
		credits = append(credits, credit)
	}

	return credits, nil
}
