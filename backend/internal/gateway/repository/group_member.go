package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type GroupMemberRepositoryImpl struct {
	queries *postgres.Queries
}

func NewGroupMemberRepository(queries *postgres.Queries) *GroupMemberRepositoryImpl {
	return &GroupMemberRepositoryImpl{
		queries: queries,
	}
}

func (gmr *GroupMemberRepositoryImpl) AddMember(ctx context.Context, groupID ulid.ULID, userID uuid.UUID) error {
	ctx, span := tracer.Start(ctx, "groupMember.AddMember")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "INSERT INTO group_members (group_id, user_id, created_at) VALUES ($1, $2, current_timestamp)")
	err := gmr.queries.AddGroupMember(ctx, postgres.AddGroupMemberParams{
		GroupID: groupID.String(),
		UserID:  userID,
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
