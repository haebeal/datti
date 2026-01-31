package usecase

import (
	"context"
	"fmt"
	"slices"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

type GroupUseCaseImpl struct {
	ur domain.UserRepository
	gr domain.GroupRepository
}

func NewGroupUseCase(ur domain.UserRepository, gr domain.GroupRepository) GroupUseCaseImpl {
	return GroupUseCaseImpl{
		ur: ur,
		gr: gr,
	}
}

func (u GroupUseCaseImpl) Create(ctx context.Context, input handler.GroupCreateInput) (output *handler.GroupCreateOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Group.Create")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	group, err := domain.CreateGroup(ctx, input.Name, input.CreatedBy)
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
		return nil, fmt.Errorf("forbidden Error")
	}

	return &handler.GroupGetOutput{
		Group: group,
	}, nil
}

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

	if input.UserID != group.CreatedBy() {
		return nil, fmt.Errorf("forbidden Error")
	}

	updatedGroup, err := group.Update(ctx, input.Name)
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
		return fmt.Errorf("forbidden Error")
	}

	members, err := u.gr.FindMembersByID(ctx, input.GroupID)
	if err != nil {
		return err
	}

	if slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == input.MemberID
	}) {
		return fmt.Errorf("member already exists")
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
		return nil, fmt.Errorf("forbidden Error")
	}

	return &handler.GroupListMembersOutput{
		Members: members,
	}, nil
}

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
		return fmt.Errorf("forbidden Error")
	}

	err = u.gr.Delete(ctx, group)
	if err != nil {
		return err
	}

	return nil
}

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
		return fmt.Errorf("forbidden Error")
	}

	// グループ作成者は誰でも削除可能、メンバーは自身のみ退出可能
	if input.UserID != group.CreatedBy() && input.UserID != input.MemberID {
		return fmt.Errorf("forbidden Error")
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
