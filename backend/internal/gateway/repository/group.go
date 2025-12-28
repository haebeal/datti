package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"go.opentelemetry.io/otel/codes"
)

type GroupRepositoryImpl struct {
	queries *postgres.Queries
}

func NewGroupRepository(queries *postgres.Queries) *GroupRepositoryImpl {
	return &GroupRepositoryImpl{
		queries: queries,
	}
}

func (gr *GroupRepositoryImpl) Create(ctx context.Context, group *domain.Group) error {
	ctx, span := tracer.Start(ctx, "group.Create")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "INSERT INTO groups (id, name, owner_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)")
	err := gr.queries.CreateGroup(ctx, postgres.CreateGroupParams{
		ID:        group.ID().String(),
		Name:      group.Name(),
		OwnerID:   group.OwnerID(),
		CreatedAt: group.CreatedAt(),
		UpdatedAt: group.UpdatedAt(),
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
