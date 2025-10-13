package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type PayerRepositoryImpl struct {
	queries *postgres.Queries
}

func NewPayerRepository(queries *postgres.Queries) *PayerRepositoryImpl {
	return &PayerRepositoryImpl{
		queries: queries,
	}
}

func (pr *PayerRepositoryImpl) FindByEventID(ctx context.Context, eventID ulid.ULID) (*domain.Payer, error) {
	ctx, span := tracer.Start(ctx, "payer.FindByEventID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM payments WHERE event_id = $1")
	payments, err := pr.queries.FindPaymentsByEventId(ctx, eventID.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	ctx, querySpan = tracer.Start(ctx, "SELECT * FROM users WHERE id = $1 LIMIT 1")
	user, err := pr.queries.FindUserByID(ctx, payments[0].PayerID)
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	payer, err := domain.NewPayer(user.ID, user.Name, user.Avatar, user.Email)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return payer, nil
}
