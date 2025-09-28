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

func (dr *DebtorRepositoryImpl) Create(event *domain.LendingEvent, payer *domain.Payer, debtor *domain.Debtor) error {
	err := dr.queries.CreatePayment(dr.ctx, postgres.CreatePaymentParams{
		EventID:  event.ID().String(),
		PayerID:  payer.ID(),
		DebtorID: debtor.ID(),
		Amount:   int32(debtor.Amount().Value()),
	})
	if err != nil {
		return err
	}

	return nil
}

func (dr *DebtorRepositoryImpl) FindByEventID(eventID ulid.ULID) ([]*domain.Debtor, error) {
	payments, err := dr.queries.FindPaymentsByEventId(dr.ctx, eventID.String())
	if err != nil {
		return nil, err
	}

	var debtors []*domain.Debtor

	for _, p := range payments {
		user, err := dr.queries.FindUserByID(dr.ctx, p.DebtorID)
		if err != nil {
			return nil, err
		}

		amount, err := domain.NewAmount(int64(p.Amount))
		if err != nil {
			return nil, err
		}

		debtor, err := domain.NewDebtor(user.ID, user.Name, user.Avatar, user.Email, amount)
		if err != nil {
			return nil, err
		}

		debtors = append(debtors, debtor)
	}

	return debtors, nil
}
