package postgres_repository

import (
	"context"

	"github.com/haebeal/datti/pkg/core"
	"github.com/haebeal/datti/pkg/gateway"
)

type EventPostgresRepository struct {
	queries *gateway.Queries
}

func NewEventPostgresRepository(queries *gateway.Queries) *EventPostgresRepository {
	return &EventPostgresRepository{
		queries: queries,
	}
}

func (er *EventPostgresRepository) Create(e *core.Event) error {
	ctx := context.Background()

	err := er.queries.CreateEvent(ctx, gateway.CreateEventParams{
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
