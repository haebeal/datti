package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type BorrowingRepositoryImpl struct {
	queries *postgres.Queries
}

func NewBorrowingRepositoryImpl(queries *postgres.Queries) *BorrowingRepositoryImpl {
	return &BorrowingRepositoryImpl{
		queries: queries,
	}
}

func (br *BorrowingRepositoryImpl) FindByGroupIDAndUserID(ctx context.Context, groupID ulid.ULID, userID string) ([]*domain.Borrowing, error) {
	ctx, span := tracer.Start(ctx, "borrowing.FindAll")
	defer span.End()

	_, querySpan := tracer.Start(ctx, "SELECT events.id AS event_id, events.name, events.event_date, payments.amount, events.created_at, events.updated_at FROM events INNER join payments on events.id = payments.event_id WHERE events.group_id = $1 AND payments.debtor_id = $2")
	events, err := br.queries.FindEventsByGroupIDAndDebtorID(ctx, postgres.FindEventsByGroupIDAndDebtorIDParams{
		GroupID:  groupID.String(),
		DebtorID: userID,
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	borrowings := []*domain.Borrowing{}
	for _, e := range events {
		eventID, err := ulid.Parse(e.EventID)
		if err != nil {
			return nil, err
		}
		amount, err := domain.NewAmount(int64(e.Amount))
		if err != nil {
			return nil, err
		}
		borrowing, err := domain.NewBorrowing(
			eventID,
			e.Name,
			amount,
			e.EventDate,
			e.CreatedAt,
			e.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		borrowings = append(borrowings, borrowing)
	}

	return borrowings, nil
}

func (br *BorrowingRepositoryImpl) FindByGroupIDAndUserIDAndEventID(ctx context.Context, groupID ulid.ULID, userID string, eventID ulid.ULID) (*domain.Borrowing, error) {
	ctx, span := tracer.Start(ctx, "borrowing.FindByID")
	defer span.End()

	_, querySpan := tracer.Start(ctx, "SELECT events.id AS event_id, events.name, events.event_date, payments.amount, events.created_at, events.updated_at FROM events INNER join payments on events.id = payments.event_id WHERE events.group_id = $1 AND payments.debtor_id = $2 AND events.id = $3 LIMIT 1")
	event, err := br.queries.FindEventByGroupIDAndDebtorIDAndEventID(ctx, postgres.FindEventByGroupIDAndDebtorIDAndEventIDParams{
		GroupID:  groupID.String(),
		DebtorID: userID,
		ID:       eventID.String(),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	parsedEventID, err := ulid.Parse(event.EventID)
	if err != nil {
		return nil, err
	}
	amount, err := domain.NewAmount(int64(event.Amount))
	if err != nil {
		return nil, err
	}
	borrowing, err := domain.NewBorrowing(
		parsedEventID,
		event.Name,
		amount,
		event.EventDate,
		event.CreatedAt,
		event.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return borrowing, nil
}
