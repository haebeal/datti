package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
)

type DebtorRepositoryImpl struct {
	ctx     context.Context
	queries *postgres.Queries
}

func NewDebtorRepository(ctx context.Context, queries *postgres.Queries) *DebtorRepositoryImpl {
	return &DebtorRepositoryImpl{
		ctx:     ctx,
		queries: queries,
	}
}

func (dr *DebtorRepositoryImpl) Create(ctx context.Context, event *domain.LendingEvent, payer *domain.Payer, debtor *domain.Debtor) error {
	_, span := tracer.Start(ctx, "debtor.Create")
	defer span.End()

	_, querySpan := tracer.Start(ctx, "INSERT INTO payments (event_id, payer_id, debtor_id, amount) VALUES ($1, $2, $3, $4)")
	err := dr.queries.CreatePayment(dr.ctx, postgres.CreatePaymentParams{
		EventID:  event.ID().String(),
		PayerID:  payer.ID(),
		DebtorID: debtor.ID(),
		Amount:   int32(debtor.Amount().Value()),
	})
	if err != nil {
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}

func (dr *DebtorRepositoryImpl) FindByEventID(ctx context.Context, eventID ulid.ULID) ([]*domain.Debtor, error) {
	ctx, span := tracer.Start(ctx, "debtor.FindByEventID")
	defer span.End()

	_, querySpan := tracer.Start(ctx, "SELECT * FROM payments WHERE event_id = $1")
	payments, err := dr.queries.FindPaymentsByEventId(dr.ctx, eventID.String())
	if err != nil {
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	var debtors []*domain.Debtor

	for _, p := range payments {
		_, querySpan = tracer.Start(ctx, "SELECT * FROM users WHERE id = $1 LIMIT 1")
		user, err := dr.queries.FindUserByID(dr.ctx, p.DebtorID)
		if err != nil {
			querySpan.RecordError(err)
			querySpan.End()
			return nil, err
		}
		querySpan.End()

		amount, err := domain.NewAmount(int64(p.Amount))
		if err != nil {
			span.RecordError(err)
			return nil, err
		}

		debtor, err := domain.NewDebtor(user.ID, user.Name, user.Avatar, user.Email, amount)
		if err != nil {
			span.RecordError(err)
			return nil, err
		}

		debtors = append(debtors, debtor)
	}

	return debtors, nil
}
