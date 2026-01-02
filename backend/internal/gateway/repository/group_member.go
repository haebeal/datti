package repository

import (
	"context"
	"errors"

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

func (gmr *GroupMemberRepositoryImpl) AddMember(ctx context.Context, groupID ulid.ULID, userID string) error {
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

func (gmr *GroupMemberRepositoryImpl) RemoveMember(ctx context.Context, groupID ulid.ULID, userID string) error {
	ctx, span := tracer.Start(ctx, "groupMember.RemoveMember")
	defer span.End()

	// メンバーに関連するpaymentsを先に削除
	ctx, deletePaymentsSpan := tracer.Start(ctx, "DELETE FROM payments WHERE id IN (SELECT ep.payment_id FROM event_payments ep INNER JOIN events e ON ep.event_id = e.id INNER JOIN payments p ON ep.payment_id = p.id WHERE e.group_id = $1 AND (p.payer_id = $2 OR p.debtor_id = $2))")
	err := gmr.queries.DeletePaymentsByGroupIDAndUserID(ctx, postgres.DeletePaymentsByGroupIDAndUserIDParams{
		GroupID: groupID.String(),
		PayerID: userID,
	})
	if err != nil {
		deletePaymentsSpan.SetStatus(codes.Error, err.Error())
		deletePaymentsSpan.RecordError(err)
		deletePaymentsSpan.End()
		return err
	}
	deletePaymentsSpan.End()

	// グループメンバーを削除
	ctx, querySpan := tracer.Start(ctx, "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2")
	err = gmr.queries.DeleteGroupMember(ctx, postgres.DeleteGroupMemberParams{
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

func (gmr *GroupMemberRepositoryImpl) FindMembersByGroupID(ctx context.Context, groupID ulid.ULID) ([]string, error) {
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

func (gmr *GroupMemberRepositoryImpl) FindMemberUsersByGroupID(ctx context.Context, groupID ulid.ULID) ([]*domain.User, error) {
	ctx, span := tracer.Start(ctx, "groupMember.FindMemberUsersByGroupID")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "SELECT u.id, u.name, u.avatar, u.email FROM users u INNER JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = $1")
	rows, err := gmr.queries.FindGroupMemberUsersByGroupID(ctx, groupID.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	members := make([]*domain.User, 0, len(rows))
	for _, row := range rows {
		user, err := domain.NewUser(row.ID, row.Name, row.Avatar, row.Email)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		members = append(members, user)
	}

	return members, nil
}
