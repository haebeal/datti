package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type RepaymentRepositoryImpl struct {
	queries *postgres.Queries
}

func NewRepaymentRepository(queries *postgres.Queries) *RepaymentRepositoryImpl {
	return &RepaymentRepositoryImpl{
		queries: queries,
	}
}

func (rr *RepaymentRepositoryImpl) Create(ctx context.Context, repayment *domain.Repayment) error {
	ctx, span := tracer.Start(ctx, "repayment.Create")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "INSERT INTO payments (id, payer_id, debtor_id, amount, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)")
	err := rr.queries.CreateRepayment(ctx, postgres.CreateRepaymentParams{
		ID:        repayment.ID().String(),
		PayerID:   repayment.PayerID(),
		DebtorID:  repayment.DebtorID(),
		Amount:    int32(repayment.Amount().Value()),
		CreatedAt: repayment.CreatedAt(),
		UpdatedAt: repayment.UpdatedAt(),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}

func (rr *RepaymentRepositoryImpl) FindByPayerID(ctx context.Context, payerID uuid.UUID) ([]*domain.Repayment, error) {
	ctx, span := tracer.Start(ctx, "repayment.FindByPayerID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM payments WHERE payer_id = $1 AND event_id IS NULL")
	payments, err := rr.queries.FindRepaymentsByPayerID(ctx, payerID)
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	repayments := make([]*domain.Repayment, 0, len(payments))
	for _, p := range payments {
		id, err := ulid.Parse(p.ID)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		amount, err := domain.NewAmount(int64(p.Amount))
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		repayment, err := domain.NewRepayment(id, p.PayerID, p.DebtorID, amount, p.CreatedAt, p.UpdatedAt)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		repayments = append(repayments, repayment)
	}

	return repayments, nil
}

func (rr *RepaymentRepositoryImpl) FindByID(ctx context.Context, id ulid.ULID) (*domain.Repayment, error) {
	ctx, span := tracer.Start(ctx, "repayment.FindByID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM payments WHERE id = $1 AND event_id IS NULL")
	p, err := rr.queries.FindRepaymentByID(ctx, id.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	parsedID, err := ulid.Parse(p.ID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	amount, err := domain.NewAmount(int64(p.Amount))
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	repayment, err := domain.NewRepayment(parsedID, p.PayerID, p.DebtorID, amount, p.CreatedAt, p.UpdatedAt)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return repayment, nil
}

func (rr *RepaymentRepositoryImpl) Update(ctx context.Context, repayment *domain.Repayment) error {
	ctx, span := tracer.Start(ctx, "repayment.Update")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "UPDATE payments SET amount = $2, updated_at = $3 WHERE id = $1")
	err := rr.queries.UpdateRepayment(ctx, postgres.UpdateRepaymentParams{
		ID:        repayment.ID().String(),
		Amount:    int32(repayment.Amount().Value()),
		UpdatedAt: repayment.UpdatedAt(),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}

func (rr *RepaymentRepositoryImpl) Delete(ctx context.Context, id ulid.ULID) error {
	ctx, span := tracer.Start(ctx, "repayment.Delete")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "DELETE FROM payments WHERE id = $1")
	err := rr.queries.DeleteRepayment(ctx, id.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}
