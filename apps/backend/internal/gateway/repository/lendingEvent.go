package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
)

type LendingEventRepositoryImpl struct {
	queries *postgres.Queries
}

func NewLendingEventRepository(queries *postgres.Queries) *LendingEventRepositoryImpl {
	return &LendingEventRepositoryImpl{
		queries: queries,
	}
}

func (lr *LendingEventRepositoryImpl) Create(ctx context.Context, e *domain.LendingEvent) error {
	_, span := tracer.Start(ctx, "lendingEvent.Create")
	defer span.End()

	err := lr.queries.CreateEvent(ctx, postgres.CreateEventParams{
		ID:        e.ID().String(),
		Amount:    int32(e.Amount().Value()),
		Name:      e.Name(),
		EventDate: e.EventDate(),
		CreatedAt: e.CreatedAt(),
		UpdatedAt: e.UpdatedAt(),
	})

	if err != nil {
		span.RecordError(err)
		return err
	}

	return nil
}

func (lr *LendingEventRepositoryImpl) FindByID(ctx context.Context, id ulid.ULID) (*domain.LendingEvent, error) {
	ctx, span := tracer.Start(ctx, "lendingEvent.FindByID")
	defer span.End()

	_, querySpan := tracer.Start(ctx, "SELECT * FROM events WHERE id = $1 LIMIT 1")
	event, err := lr.queries.FindEventById(ctx, id.String())
	if err != nil {
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	eventID, err := ulid.Parse(event.ID)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	amount, err := domain.NewAmount(int64(event.Amount))
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	lendingEvent, err := domain.NewLendingEvent(eventID, event.Name, amount, event.EventDate, event.CreatedAt, event.UpdatedAt)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	return lendingEvent, nil
}
