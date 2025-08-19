package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/jackc/pgx/v5"
)

type PaymentEventRepositoryImpl struct {
	ctx     context.Context
	db      *pgx.Conn
	queries *postgres.Queries
}

func NewPaymentEvent(ctx context.Context, db *pgx.Conn, queries *postgres.Queries) *PaymentEventRepositoryImpl {
	return &PaymentEventRepositoryImpl{
		ctx:     ctx,
		db:      db,
		queries: queries,
	}
}

func (per *PaymentEventRepositoryImpl) Create(pe *domain.PaymentEvent) error {
	tx, err := per.db.Begin(per.ctx)
	if err != nil {
		return err
	}

	qtx := per.queries.WithTx(tx)
	defer tx.Rollback(per.ctx)

	err = qtx.CreateEvent(per.ctx, postgres.CreateEventParams{
		ID:        pe.ID().String(),
		Name:      pe.Name(),
		PayerID:   pe.Payer().ID(),
		Amount:    int32(pe.Payer().Amount().Value()),
		EventDate: pe.EventDate(),
		CreatedAt: pe.CreatedAt(),
		UpdatedAt: pe.UpdatedAt(),
	})
	if err != nil {
		return err
	}

	for _, d := range pe.Debtors() {
		err = qtx.CreatePayment(per.ctx, postgres.CreatePaymentParams{
			EventID:  pe.ID().String(),
			DebtorID: d.ID(),
			Amount:   int32(d.Amount().Value()),
		})
		if err != nil {
			return err
		}
	}

	return tx.Commit(per.ctx)
}

func (per *PaymentEventRepositoryImpl) FindAll() ([]*domain.PaymentEvent, error) {
	eventRows, err := per.queries.FindAllEvents(per.ctx)
	if err != nil {
		return nil, err
	}

	var paymentEvents []*domain.PaymentEvent
	for _, eventRow := range eventRows {
		paymentRows, err := per.queries.FindPaymentsByEventId(per.ctx, eventRow.ID)
		if err != nil {
			return nil, err
		}

		var debtors []*domain.Debtor
		for _, paymentRow := range paymentRows {
			userRow, err := per.queries.FindUserByID(per.ctx, paymentRow.DebtorID)
			if err != nil {
				return nil, err
			}
			user, err := domain.NewUser(userRow.ID.String(), userRow.Name, userRow.Avatar, userRow.Email)
			if err != nil {
				return nil, err
			}
			amount, err := domain.NewAmount(int64(paymentRow.Amount))
			if err != nil {
				return nil, err
			}

			debtor, err := domain.NewDebtor(user, amount)
			if err != nil {
				return nil, err
			}

			debtors = append(debtors, debtor)
		}

		eventRow, err := per.queries.FindEventById(per.ctx, eventRow.ID)
		if err != nil {
			return nil, err
		}

		userRow, err := per.queries.FindUserByID(per.ctx, eventRow.PayerID)
		if err != nil {
			return nil, err
		}
		user, err := domain.NewUser(userRow.ID.String(), userRow.Name, userRow.Avatar, userRow.Email)
		if err != nil {
			return nil, err
		}
		amount, err := domain.NewAmount(int64(eventRow.Amount))
		if err != nil {
			return nil, err
		}
		payer, err := domain.NewPayer(user, amount)
		if err != nil {
			return nil, err
		}

		pe, err := domain.NewPaymentEvent(
			eventRow.ID,
			eventRow.Name,
			payer,
			debtors,
			eventRow.EventDate,
			eventRow.CreatedAt,
			eventRow.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		paymentEvents = append(paymentEvents, pe)
	}

	return paymentEvents, nil
}

func (per *PaymentEventRepositoryImpl) FindByID(id string) (*domain.PaymentEvent, error) {
	paymentRows, err := per.queries.FindPaymentsByEventId(per.ctx, id)
	if err != nil {
		return nil, err
	}

	var debtors []*domain.Debtor
	for _, paymentRow := range paymentRows {
		userRow, err := per.queries.FindUserByID(per.ctx, paymentRow.DebtorID)
		if err != nil {
			return nil, err
		}
		user, err := domain.NewUser(userRow.ID.String(), userRow.Name, userRow.Avatar, userRow.Email)
		if err != nil {
			return nil, err
		}
		amount, err := domain.NewAmount(int64(paymentRow.Amount))
		if err != nil {
			return nil, err
		}

		debtor, err := domain.NewDebtor(user, amount)
		if err != nil {
			return nil, err
		}

		debtors = append(debtors, debtor)
	}

	eventRow, err := per.queries.FindEventById(per.ctx, id)
	if err != nil {
		return nil, err
	}

	userRow, err := per.queries.FindUserByID(per.ctx, eventRow.PayerID)
	if err != nil {
		return nil, err
	}
	user, err := domain.NewUser(userRow.ID.String(), userRow.Name, userRow.Avatar, userRow.Email)
	if err != nil {
		return nil, err
	}
	amount, err := domain.NewAmount(int64(eventRow.Amount))
	if err != nil {
		return nil, err
	}
	payer, err := domain.NewPayer(user, amount)
	if err != nil {
		return nil, err
	}

	pe, err := domain.NewPaymentEvent(
		eventRow.ID,
		eventRow.Name,
		payer,
		debtors,
		eventRow.EventDate,
		eventRow.CreatedAt,
		eventRow.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return pe, nil
}

func (per *PaymentEventRepositoryImpl) Update(pe *domain.PaymentEvent) error {
	tx, err := per.db.Begin(per.ctx)
	if err != nil {
		return err
	}

	qtx := per.queries.WithTx(tx)
	defer tx.Rollback(per.ctx)

	err = qtx.UpdateEvent(per.ctx, postgres.UpdateEventParams{
		ID:        pe.ID().String(),
		Name:      pe.Name(),
		PayerID:   pe.Payer().ID(),
		Amount:    int32(pe.Payer().Amount().Value()),
		EventDate: pe.EventDate(),
		UpdatedAt: pe.UpdatedAt(),
	})
	if err != nil {
		return err
	}

	for _, d := range pe.Debtors() {
		err = qtx.UpdatePayment(per.ctx, postgres.UpdatePaymentParams{
			EventID:  pe.ID().String(),
			DebtorID: d.ID(),
			Amount:   int32(d.Amount().Value()),
		})
		if err != nil {
			return err
		}
	}

	return tx.Commit(per.ctx)

}

func (per *PaymentEventRepositoryImpl) Delete(pe *domain.PaymentEvent) error {
	err := per.queries.DeleteEvent(per.ctx, pe.ID().String())
	if err != nil {
		return err
	}

	return nil
}
