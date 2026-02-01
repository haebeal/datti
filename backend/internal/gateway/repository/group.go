package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

// GroupRepositoryImpl グループリポジトリの実装
type GroupRepositoryImpl struct {
	queries *postgres.Queries
}

// NewGroupRepository GroupRepositoryImplのファクトリ関数
func NewGroupRepository(queries *postgres.Queries) *GroupRepositoryImpl {
	return &GroupRepositoryImpl{
		queries: queries,
	}
}

// Create グループを作成する
func (gr *GroupRepositoryImpl) Create(ctx context.Context, g *domain.Group) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Group.Create")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	err = gr.queries.CreateGroup(ctx, postgres.CreateGroupParams{
		ID:        g.ID().String(),
		Name:      g.Name(),
		CreatedBy: g.CreatedBy(),
		CreatedAt: g.CreatedAt(),
		UpdatedAt: g.UpdatedAt(),
	})
	if err != nil {
		return err
	}

	return nil
}

// FindByMemberUserID ユーザーが所属するグループ一覧を取得する
func (gr *GroupRepositoryImpl) FindByMemberUserID(ctx context.Context, userID string) (groups []*domain.Group, err error) {
	ctx, span := tracer.Start(ctx, "repository.Group.FindByMemberUserID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	rows, err := gr.queries.FindGroupsByMemberUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	groups = make([]*domain.Group, 0, len(rows))
	for _, row := range rows {
		groupID, err := ulid.Parse(row.ID)
		if err != nil {
			return nil, err
		}
		group, err := domain.NewGroup(ctx, groupID, row.Name, row.CreatedBy, row.CreatedAt, row.UpdatedAt)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

// FindByID グループをIDで取得する
func (gr *GroupRepositoryImpl) FindByID(ctx context.Context, id ulid.ULID) (g *domain.Group, err error) {
	ctx, span := tracer.Start(ctx, "repository.Group.FindByID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	row, err := gr.queries.FindGroupByID(ctx, id.String())
	if err != nil {
		return nil, err
	}

	parsedID, err := ulid.Parse(row.ID)
	if err != nil {
		return nil, err
	}

	g, err = domain.NewGroup(ctx, parsedID, row.Name, row.CreatedBy, row.CreatedAt, row.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return g, nil
}

// Update グループを更新する
func (gr *GroupRepositoryImpl) Update(ctx context.Context, g *domain.Group) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Group.Update")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	err = gr.queries.UpdateGroup(ctx, postgres.UpdateGroupParams{
		ID:        g.ID().String(),
		Name:      g.Name(),
		UpdatedAt: g.UpdatedAt(),
	})
	if err != nil {
		return err
	}

	return nil
}

// Delete グループを削除する
func (gr *GroupRepositoryImpl) Delete(ctx context.Context, g *domain.Group) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Group.Delete")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// グループに関連するpaymentsを先に削除
	err = gr.queries.DeletePaymentsByGroupID(ctx, g.ID().String())
	if err != nil {
		return err
	}

	// グループを削除 (CASCADE により events, event_payments, group_members が削除される)
	err = gr.queries.DeleteGroup(ctx, g.ID().String())
	if err != nil {
		return err
	}

	return nil
}

// AddMember グループにメンバーを追加する
func (gr *GroupRepositoryImpl) AddMember(ctx context.Context, g *domain.Group, u *domain.User) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Group.AddMember")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	err = gr.queries.AddGroupMember(ctx, postgres.AddGroupMemberParams{
		GroupID: g.ID().String(),
		UserID:  u.ID(),
	})
	if err != nil {
		return err
	}

	return nil
}

// FindMembersByID グループのメンバー一覧を取得する
func (gr *GroupRepositoryImpl) FindMembersByID(ctx context.Context, id ulid.ULID) (members []*domain.User, err error) {
	ctx, span := tracer.Start(ctx, "repository.Group.FindMembersByID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	rows, err := gr.queries.FindGroupMemberUsersByGroupID(ctx, id.String())
	if err != nil {
		return nil, err
	}

	members = make([]*domain.User, 0, len(rows))
	for _, row := range rows {
		user, err := domain.NewUser(ctx, row.ID, row.Name, row.Avatar, row.Email)
		if err != nil {
			return nil, err
		}
		members = append(members, user)
	}

	return members, nil
}

// RemoveMember グループからメンバーを削除する
func (gr *GroupRepositoryImpl) RemoveMember(ctx context.Context, g *domain.Group, u *domain.User) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Group.RemoveMember")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// メンバーに関連するpaymentsを先に削除
	err = gr.queries.DeletePaymentsByGroupIDAndUserID(ctx, postgres.DeletePaymentsByGroupIDAndUserIDParams{
		GroupID: g.ID().String(),
		PayerID: u.ID(),
	})
	if err != nil {
		return err
	}

	// グループメンバーを削除
	err = gr.queries.DeleteGroupMember(ctx, postgres.DeleteGroupMemberParams{
		GroupID: g.ID().String(),
		UserID:  u.ID(),
	})
	if err != nil {
		return err
	}

	return nil
}
