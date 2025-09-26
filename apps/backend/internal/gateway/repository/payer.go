package repository

import (
	"context"

	"github.com/google/uuid"
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

func (pr *PayerRepositoryImpl) FindByEventID(userID uuid.UUID, eventID ulid.ULID) (*domain.Payer, error) {
	event, err := pr.queries.FindEventById(pr.ctx, eventID.String())
	if err != nil {
		return nil, err
	}

	user, err := pr.queries.FindUserByID(pr.ctx, event.PayerID)
	if err != nil {
		return nil, err
	}

	payment, err := pr.queries.FindPaymentByDebtorId(pr.ctx, postgres.FindPaymentByDebtorIdParams{
		EventID:  event.ID,
		DebtorID: userID,
	})
	if err != nil {
		return nil, err
	}

	amount, err := domain.NewAmount(int64(payment.Amount))
	if err != nil {
		return nil, err
	}

	payer, err := domain.NewPayer(user.ID, user.Name, user.Avatar, user.Email, amount)
	if err != nil {
		return nil, err
	}

	return payer, nil
}
