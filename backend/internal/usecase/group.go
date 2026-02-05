package usecase

import (
	"context"
	"slices"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

// GroupUseCaseImpl グループに関するユースケースの実装
type GroupUseCaseImpl struct {
	ur domain.UserRepository
	gr domain.GroupRepository
}

// NewGroupUseCase GroupUseCaseImplのファクトリ関数
func NewGroupUseCase(ur domain.UserRepository, gr domain.GroupRepository) GroupUseCaseImpl {
	return GroupUseCaseImpl{
		ur: ur,
		gr: gr,
	}
}

// Create グループを作成し、作成者をメンバーに追加する
func (u GroupUseCaseImpl) Create(ctx context.Context, input handler.GroupCreateInput) (output *handler.GroupCreateOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Group.Create")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	group, err := domain.CreateGroup(ctx, input.Name, input.Description, input.CreatedBy)
	if err != nil {
		return nil, err
	}

	err = u.gr.Create(ctx, group)
	if err != nil {
		return nil, err
	}

	owner, err := u.ur.FindByID(ctx, input.CreatedBy)
	if err != nil {
		return nil, err
	}

	err = u.gr.AddMember(ctx, group, owner)
	if err != nil {
		return nil, err
	}

	return &handler.GroupCreateOutput{
		Group: group,
	}, nil
}

// GetAll ユーザーが所属する全グループを取得する
func (u GroupUseCaseImpl) GetAll(ctx context.Context, input handler.GroupGetAllInput) (output *handler.GroupGetAllOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Group.GetAll")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	groups, err := u.gr.FindByMemberUserID(ctx, input.UserID)
	if err != nil {
		return nil, err
	}

	return &handler.GroupGetAllOutput{
		Groups: groups,
	}, nil
}

// Get グループを取得する (メンバーのみアクセス可能)
func (u GroupUseCaseImpl) Get(ctx context.Context, input handler.GroupGetInput) (output *handler.GroupGetOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Group.Get")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		return nil, err
	}

	members, err := u.gr.FindMembersByID(ctx, input.GroupID)
	if err != nil {
		return nil, err
	}

	if !slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == input.UserID
	}) {
		return nil, domain.NewForbiddenError("グループのメンバーではありません")
	}

	return &handler.GroupGetOutput{
		Group: group,
	}, nil
}

// Update グループ情報を更新する
// - グループ名の変更: 作成者のみ実行可能
// - 説明文の変更: メンバー全員が実行可能
func (u GroupUseCaseImpl) Update(ctx context.Context, input handler.GroupUpdateInput) (output *handler.GroupUpdateOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Group.Update")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		return nil, err
	}

	// メンバーチェック
	members, err := u.gr.FindMembersByID(ctx, input.GroupID)
	if err != nil {
		return nil, err
	}

	isMember := slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == input.UserID
	})
	if !isMember {
		return nil, domain.NewForbiddenError("グループのメンバーではありません")
	}

	// グループ名が変更されている場合は作成者のみ許可
	nameChanged := input.Name != group.Name()
	if nameChanged && input.UserID != group.CreatedBy() {
		return nil, domain.NewForbiddenError("グループ名の更新権限がありません")
	}

	updatedGroup, err := group.Update(ctx, input.Name, input.Description)
	if err != nil {
		return nil, err
	}

	err = u.gr.Update(ctx, updatedGroup)
	if err != nil {
		return nil, err
	}

	return &handler.GroupUpdateOutput{
		Group: updatedGroup,
	}, nil
}

// AddMember グループにメンバーを追加する (作成者のみ実行可能)
func (u GroupUseCaseImpl) AddMember(ctx context.Context, input handler.GroupAddMemberInput) (err error) {
	ctx, span := tracer.Start(ctx, "usecase.Group.AddMember")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		return err
	}

	if input.UserID != group.CreatedBy() {
		return domain.NewForbiddenError("メンバーの追加権限がありません")
	}

	members, err := u.gr.FindMembersByID(ctx, input.GroupID)
	if err != nil {
		return err
	}

	if slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == input.MemberID
	}) {
		return domain.NewConflictError("member", "既にメンバーに追加されています")
	}

	member, err := u.ur.FindByID(ctx, input.MemberID)
	if err != nil {
		return err
	}

	err = u.gr.AddMember(ctx, group, member)
	if err != nil {
		return err
	}

	return nil
}

// ListMembers グループのメンバー一覧を取得する (メンバーのみアクセス可能)
func (u GroupUseCaseImpl) ListMembers(ctx context.Context, input handler.GroupListMembersInput) (output *handler.GroupListMembersOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Group.ListMembers")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	members, err := u.gr.FindMembersByID(ctx, input.GroupID)
	if err != nil {
		return nil, err
	}

	if !slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == input.UserID
	}) {
		return nil, domain.NewForbiddenError("グループのメンバーではありません")
	}

	return &handler.GroupListMembersOutput{
		Members: members,
	}, nil
}

// Delete グループを削除する (作成者のみ実行可能)
func (u GroupUseCaseImpl) Delete(ctx context.Context, input handler.GroupDeleteInput) (err error) {
	ctx, span := tracer.Start(ctx, "usecase.Group.Delete")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		return err
	}

	// グループ作成者のみ削除可能
	if input.UserID != group.CreatedBy() {
		return domain.NewForbiddenError("グループの削除権限がありません")
	}

	err = u.gr.Delete(ctx, group)
	if err != nil {
		return err
	}

	return nil
}

// RemoveMember グループからメンバーを削除する (作成者は誰でも削除可能、メンバーは自身のみ退出可能)
func (u GroupUseCaseImpl) RemoveMember(ctx context.Context, input handler.GroupRemoveMemberInput) (err error) {
	ctx, span := tracer.Start(ctx, "usecase.Group.RemoveMember")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		return err
	}

	// グループ作成者は退出できない
	if input.MemberID == group.CreatedBy() {
		return domain.NewForbiddenError("グループ作成者は退出できません")
	}

	// グループ作成者は誰でも削除可能、メンバーは自身のみ退出可能
	if input.UserID != group.CreatedBy() && input.UserID != input.MemberID {
		return domain.NewForbiddenError("メンバーの削除権限がありません")
	}

	member, err := u.ur.FindByID(ctx, input.MemberID)
	if err != nil {
		return err
	}

	err = u.gr.RemoveMember(ctx, group, member)
	if err != nil {
		return err
	}

	return nil
}
