package repository

import (
	"context"
	"errors"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/jackc/pgx/v5"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

// RepaymentRepositoryImpl 返済リポジトリの実装
type RepaymentRepositoryImpl struct {
	queries *postgres.Queries
}

// NewRepaymentRepository RepaymentRepositoryImplのファクトリ関数
func NewRepaymentRepository(queries *postgres.Queries) *RepaymentRepositoryImpl {
	return &RepaymentRepositoryImpl{
		queries: queries,
	}
}

// Create 返済を作成する
func (rr *RepaymentRepositoryImpl) Create(ctx context.Context, r *domain.Repayment) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Repayment.Create")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	err = rr.queries.CreateRepayment(ctx, postgres.CreateRepaymentParams{
		ID:        r.ID().String(),
		PayerID:   r.PayerID(),
		DebtorID:  r.DebtorID(),
		Amount:    int32(r.Amount()),
		CreatedAt: r.CreatedAt(),
		UpdatedAt: r.UpdatedAt(),
	})
	if err != nil {
		return err
	}

	return nil
}

// FindByID 返済をIDで取得する
func (rr *RepaymentRepositoryImpl) FindByID(ctx context.Context, id ulid.ULID) (r *domain.Repayment, err error) {
	ctx, span := tracer.Start(ctx, "repository.Repayment.FindByID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	p, err := rr.queries.FindRepaymentByID(ctx, id.String())
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.NewNotFoundError("repayment", id.String())
		}
		return nil, err
	}

	parsedID, err := ulid.Parse(p.ID)
	if err != nil {
		return nil, err
	}

	r, err = domain.NewRepayment(ctx, parsedID, p.PayerID, p.DebtorID, int64(p.Amount), p.CreatedAt, p.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return r, nil
}

// FindByPayerID 支払い者IDで返済一覧を取得する
func (rr *RepaymentRepositoryImpl) FindByPayerID(ctx context.Context, payerID string, cursor *string, limit *int32) (repayments []*domain.Repayment, err error) {
	ctx, span := tracer.Start(ctx, "repository.Repayment.FindByPayerID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	payments, err := rr.queries.FindRepaymentsByPayerIDWithCursor(ctx, postgres.FindRepaymentsByPayerIDWithCursorParams{
		PayerID: payerID,
		Cursor:  cursor,
		Limit:   *limit,
	})
	if err != nil {
		return nil, err
	}

	repayments = make([]*domain.Repayment, 0, len(payments))

	for _, p := range payments {
		id, err := ulid.Parse(p.ID)
		if err != nil {
			return nil, err
		}

		repayment, err := domain.NewRepayment(ctx, id, p.PayerID, p.DebtorID, int64(p.Amount), p.CreatedAt, p.UpdatedAt)
		if err != nil {
			return nil, err
		}

		repayments = append(repayments, repayment)
	}

	return repayments, nil
}

// Update 返済を更新する
func (rr *RepaymentRepositoryImpl) Update(ctx context.Context, r *domain.Repayment) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Repayment.Update")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	err = rr.queries.UpdateRepayment(ctx, postgres.UpdateRepaymentParams{
		ID:        r.ID().String(),
		Amount:    int32(r.Amount()),
		UpdatedAt: r.UpdatedAt(),
	})
	if err != nil {
		return err
	}

	return nil
}

// Delete 返済を削除する
func (rr *RepaymentRepositoryImpl) Delete(ctx context.Context, id ulid.ULID) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Repayment.Delete")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	err = rr.queries.DeleteRepayment(ctx, id.String())
	if err != nil {
		return err
	}

	return nil
}
