package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
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

func (gr *GroupRepositoryImpl) FindByMemberUserID(ctx context.Context, userID uuid.UUID) ([]*domain.Group, error) {
	ctx, span := tracer.Start(ctx, "group.FindByMemberUserID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT g.* FROM groups g INNER JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = $1")
	rows, err := gr.queries.FindGroupsByMemberUserID(ctx, userID)
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	groups := make([]*domain.Group, 0, len(rows))
	for _, row := range rows {
		groupID, err := ulid.Parse(row.ID)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		group, err := domain.NewGroup(groupID, row.Name, row.OwnerID, row.CreatedAt, row.UpdatedAt)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}
