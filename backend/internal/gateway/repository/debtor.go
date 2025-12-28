package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type DebtorRepositoryImpl struct {
	queries *postgres.Queries
}

func NewDebtorRepository(queries *postgres.Queries) *DebtorRepositoryImpl {
	return &DebtorRepositoryImpl{
		queries: queries,
	}
}

func (dr *DebtorRepositoryImpl) Create(ctx context.Context, event *domain.Lending, payer *domain.Payer, debtor *domain.Debtor) error {
	ctx, span := tracer.Start(ctx, "debtor.Create")
	defer span.End()

	paymentID := ulid.Make()

	ctx, querySpan := tracer.Start(ctx, "INSERT INTO payments (id, payer_id, debtor_id, amount, created_at, updated_at) VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp)")
	err := dr.queries.CreatePayment(ctx, postgres.CreatePaymentParams{
		ID:       paymentID.String(),
		PayerID:  payer.ID(),
		DebtorID: debtor.ID(),
		Amount:   int32(debtor.Amount().Value()),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	ctx, eventPaymentSpan := tracer.Start(ctx, "INSERT INTO event_payments (event_id, payment_id) VALUES ($1, $2)")
	err = dr.queries.CreateEventPayment(ctx, postgres.CreateEventPaymentParams{
		EventID:   event.ID().String(),
		PaymentID: paymentID.String(),
	})
	if err != nil {
		eventPaymentSpan.SetStatus(codes.Error, err.Error())
		eventPaymentSpan.RecordError(err)
		eventPaymentSpan.End()
		return err
	}
	eventPaymentSpan.End()

	return nil
}

func (dr *DebtorRepositoryImpl) FindByEventID(ctx context.Context, eventID ulid.ULID) ([]*domain.Debtor, error) {
	ctx, span := tracer.Start(ctx, "debtor.FindByEventID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT * FROM payments WHERE event_id = $1")
	payments, err := dr.queries.FindPaymentsByEventId(ctx, eventID.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	var debtors []*domain.Debtor

	for _, p := range payments {
		ctx, querySpan = tracer.Start(ctx, "SELECT * FROM users WHERE id = $1 LIMIT 1")
		user, err := dr.queries.FindUserByID(ctx, p.DebtorID)
		if err != nil {
			querySpan.SetStatus(codes.Error, err.Error())
			querySpan.RecordError(err)
			querySpan.End()
			return nil, err
		}
		querySpan.End()

		amount, err := domain.NewAmount(int64(p.Amount))
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		debtor, err := domain.NewDebtor(user.ID, user.Name, user.Avatar, user.Email, amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		debtors = append(debtors, debtor)
	}

	return debtors, nil
}

func (dr *DebtorRepositoryImpl) Update(ctx context.Context, event *domain.Lending, debtor *domain.Debtor) error {
	ctx, span := tracer.Start(ctx, "debtor.Update")
	defer span.End()

	ctx, findSpan := tracer.Start(ctx, "SELECT payment FROM event_payments JOIN payments WHERE event_id = $1 AND debtor_id = $2")
	payment, err := dr.queries.FindPaymentByDebtorId(ctx, postgres.FindPaymentByDebtorIdParams{
		EventID:  event.ID().String(),
		DebtorID: debtor.ID(),
	})
	if err != nil {
		findSpan.SetStatus(codes.Error, err.Error())
		findSpan.RecordError(err)
		findSpan.End()
		return err
	}
	findSpan.End()

	ctx, querySpan := tracer.Start(ctx, "UPDATE payments SET amount = $2, updated_at = current_timestamp WHERE id = $1")
	err = dr.queries.UpdatePaymentAmount(ctx, postgres.UpdatePaymentAmountParams{
		ID:     payment.ID,
		Amount: int32(debtor.Amount().Value()),
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

func (dr *DebtorRepositoryImpl) Delete(ctx context.Context, event *domain.Lending, debtor *domain.Debtor) error {
	ctx, span := tracer.Start(ctx, "debtor.Delete")
	defer span.End()

	ctx, findSpan := tracer.Start(ctx, "SELECT payment FROM event_payments JOIN payments WHERE event_id = $1 AND debtor_id = $2")
	payment, err := dr.queries.FindPaymentByDebtorId(ctx, postgres.FindPaymentByDebtorIdParams{
		EventID:  event.ID().String(),
		DebtorID: debtor.ID(),
	})
	if err != nil {
		findSpan.SetStatus(codes.Error, err.Error())
		findSpan.RecordError(err)
		findSpan.End()
		return err
	}
	findSpan.End()

	ctx, querySpan := tracer.Start(ctx, "DELETE FROM payments WHERE id = $1")
	err = dr.queries.DeletePayment(ctx, payment.ID)
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}
