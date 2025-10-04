package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
)

type PayerRepositoryImpl struct {
	ctx     context.Context
	queries *postgres.Queries
}

func NewPayerRepository(ctx context.Context, queries *postgres.Queries) *PayerRepositoryImpl {
	return &PayerRepositoryImpl{
		ctx:     ctx,
		queries: queries,
	}
}

func (pr *PayerRepositoryImpl) FindByEventID(ctx context.Context, eventID ulid.ULID) (*domain.Payer, error) {
	_, span := tracer.Start(ctx, "payer.FindByEventID")
	defer span.End()

	_, querySpan := tracer.Start(ctx, "SELECT * FROM payments WHERE event_id = $1")
	payments, err := pr.queries.FindPaymentsByEventId(pr.ctx, eventID.String())
	if err != nil {
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	_, querySpan = tracer.Start(ctx, "SELECT * FROM users WHERE id = $1 LIMIT 1")
	user, err := pr.queries.FindUserByID(pr.ctx, payments[0].PayerID)
	if err != nil {
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	payer, err := domain.NewPayer(user.ID, user.Name, user.Avatar, user.Email)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	return payer, nil
}
