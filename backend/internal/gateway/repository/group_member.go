package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/jackc/pgx/v5/pgconn"
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
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return domain.ErrGroupMemberAlreadyExists
		}
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}

func (gmr *GroupMemberRepositoryImpl) FindMembersByGroupID(ctx context.Context, groupID ulid.ULID) ([]uuid.UUID, error) {
	ctx, span := tracer.Start(ctx, "groupMember.FindMembersByGroupID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT user_id FROM group_members WHERE group_id = $1 ORDER BY created_at ASC")
	rows, err := gmr.queries.FindGroupMembersByGroupID(ctx, groupID.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	return rows, nil
}
