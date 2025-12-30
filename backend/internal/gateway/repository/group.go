package repository

import (
	"context"

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

	ctx, querySpan := tracer.Start(ctx, "INSERT INTO groups (id, name, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)")
	err := gr.queries.CreateGroup(ctx, postgres.CreateGroupParams{
		ID:        group.ID().String(),
		Name:      group.Name(),
		CreatedBy: group.CreatedBy(),
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

func (gr *GroupRepositoryImpl) FindByMemberUserID(ctx context.Context, userID string) ([]*domain.Group, error) {
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
		group, err := domain.NewGroup(groupID, row.Name, row.CreatedBy, row.CreatedAt, row.UpdatedAt)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (gr *GroupRepositoryImpl) FindByID(ctx context.Context, groupID ulid.ULID) (*domain.Group, error) {
	ctx, span := tracer.Start(ctx, "group.FindByID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT id, name, created_by, created_at, updated_at FROM groups WHERE id = $1 LIMIT 1")
	row, err := gr.queries.FindGroupByID(ctx, groupID.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	parsedID, err := ulid.Parse(row.ID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	group, err := domain.NewGroup(parsedID, row.Name, row.CreatedBy, row.CreatedAt, row.UpdatedAt)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return group, nil
}

func (gr *GroupRepositoryImpl) Update(ctx context.Context, group *domain.Group) error {
	ctx, span := tracer.Start(ctx, "group.Update")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "UPDATE groups SET name = $2, updated_at = $3 WHERE id = $1")
	err := gr.queries.UpdateGroup(ctx, postgres.UpdateGroupParams{
		ID:        group.ID().String(),
		Name:      group.Name(),
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

func (gr *GroupRepositoryImpl) Delete(ctx context.Context, groupID ulid.ULID) error {
	ctx, span := tracer.Start(ctx, "group.Delete")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "DELETE FROM groups WHERE id = $1")
	err := gr.queries.DeleteGroup(ctx, groupID.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}
