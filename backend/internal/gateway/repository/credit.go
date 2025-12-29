package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"go.opentelemetry.io/otel/codes"
)

type CreditRepositoryImpl struct {
	queries *postgres.Queries
}

func NewCreditRepository(queries *postgres.Queries) *CreditRepositoryImpl {
	return &CreditRepositoryImpl{
		queries: queries,
	}
}

func (r *CreditRepositoryImpl) ListLendingCreditsByUserID(ctx context.Context, userID string) ([]*domain.Credit, error) {
	ctx, span := tracer.Start(ctx, "credit.ListLendingCreditsByUserID")
	defer span.End()

	rows, err := r.queries.ListLendingCreditAmountsByUserID(ctx, userID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	credits := make([]*domain.Credit, 0, len(rows))
	for _, row := range rows {
		amount, err := domain.NewAmount(row.Amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		credit, err := domain.NewCredit(row.UserID, amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		credits = append(credits, credit)
	}

	return credits, nil
}

func (r *CreditRepositoryImpl) ListBorrowingCreditsByUserID(ctx context.Context, userID string) ([]*domain.Credit, error) {
	ctx, span := tracer.Start(ctx, "credit.ListBorrowingCreditsByUserID")
	defer span.End()

	rows, err := r.queries.ListBorrowingCreditAmountsByUserID(ctx, userID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	credits := make([]*domain.Credit, 0, len(rows))
	for _, row := range rows {
		amount, err := domain.NewAmount(row.Amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		credit, err := domain.NewCredit(row.UserID, amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		credits = append(credits, credit)
	}

	return credits, nil
}
