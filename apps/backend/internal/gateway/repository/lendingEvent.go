package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
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
