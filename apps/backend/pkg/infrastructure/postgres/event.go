package postgres

import (
	"context"

	"github.com/haebeal/datti/pkg/core"
	"github.com/haebeal/datti/pkg/gateway"
)

type EventPostgresRepository struct {
	ctx     context.Context
	queries *gateway.Queries
}

func NewEventPostgresRepository(ctx context.Context, queries *gateway.Queries) *EventPostgresRepository {
	return &EventPostgresRepository{
		ctx:     ctx,
		queries: queries,
	}
}

func (er *EventPostgresRepository) Create(e *core.Event) error {
	err := er.queries.CreateEvent(er.ctx, gateway.CreateEventParams{
		ID:        e.ID().String(),
		Name:      e.Name(),
		EventAt:   e.EventDate(),
		CreatedAt: e.CreatedAt(),
		UpdatedAt: e.UpdatedAt(),
	})
	if err != nil {
		return err
	}

	return nil
}
