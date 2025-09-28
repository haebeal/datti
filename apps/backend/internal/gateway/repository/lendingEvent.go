package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
)

type LendingEventRepositoryImpl struct {
	ctx     context.Context
	queries *postgres.Queries
}

func NewLendingEventRepository(ctx context.Context, queries *postgres.Queries) *LendingEventRepositoryImpl {
	return &LendingEventRepositoryImpl{
		ctx:     ctx,
		queries: queries,
	}
}

func (lr *LendingEventRepositoryImpl) Create(e *domain.LendingEvent) error {
	err := lr.queries.CreateEvent(lr.ctx, postgres.CreateEventParams{
		ID:        e.ID().String(),
		Name:      e.Name(),
		EventDate: e.EventDate(),
		CreatedAt: e.CreatedAt(),
		UpdatedAt: e.UpdatedAt(),
	})

	if err != nil {
		return err
	}

	return nil
}

func (lr *LendingEventRepositoryImpl) FindByID(id ulid.ULID) (*domain.LendingEvent, error) {
	event, err := lr.queries.FindEventById(lr.ctx, id.String())
	if err != nil {
		return nil, err
	}

	eventID, err := ulid.Parse(event.ID)
	if err != nil {
		return nil, err
	}

	amount, err := domain.NewAmount(int64(event.Amount))
	if err != nil {
		return nil, err
	}

	lendingEvent, err := domain.NewLendingEvent(eventID, event.Name, amount, event.EventDate, event.CreatedAt, event.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return lendingEvent, nil
}
