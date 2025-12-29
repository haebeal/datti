package usecase

import (
	"context"
	"fmt"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

type GroupUseCaseImpl struct {
	gr  domain.GroupRepository
	gmr domain.GroupMemberRepository
}

func NewGroupUseCase(gr domain.GroupRepository, gmr domain.GroupMemberRepository) GroupUseCaseImpl {
	return GroupUseCaseImpl{
		gr:  gr,
		gmr: gmr,
	}
}

func (u GroupUseCaseImpl) Create(ctx context.Context, input handler.GroupCreateInput) (*handler.GroupCreateOutput, error) {
	ctx, span := tracer.Start(ctx, "group.Create")
	defer span.End()

	group, err := domain.CreateGroup(input.Name, input.CreatedBy)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	err = u.gr.Create(ctx, group)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	err = u.gmr.AddMember(ctx, group.ID(), group.CreatedBy())
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.GroupCreateOutput{
		Group: group,
	}, nil
}

func (u GroupUseCaseImpl) GetAll(ctx context.Context, input handler.GroupGetAllInput) (*handler.GroupGetAllOutput, error) {
	ctx, span := tracer.Start(ctx, "group.GetAll")
	defer span.End()

	groups, err := u.gr.FindByMemberUserID(ctx, input.UserID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.GroupGetAllOutput{
		Groups: groups,
	}, nil
}

func (u GroupUseCaseImpl) Get(ctx context.Context, input handler.GroupGetInput) (*handler.GroupGetOutput, error) {
	ctx, span := tracer.Start(ctx, "group.Get")
	defer span.End()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	if input.UserID != group.CreatedBy() {
		memberIDs, err := u.gmr.FindMembersByGroupID(ctx, input.GroupID)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		authorized := false
		for _, memberID := range memberIDs {
			if memberID == input.UserID {
				authorized = true
				break
			}
		}

		if !authorized {
			return nil, fmt.Errorf("forbidden Error")
		}
	}

	return &handler.GroupGetOutput{
		Group: group,
	}, nil
}

func (u GroupUseCaseImpl) Update(ctx context.Context, input handler.GroupUpdateInput) (*handler.GroupUpdateOutput, error) {
	ctx, span := tracer.Start(ctx, "group.Update")
	defer span.End()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	if input.UserID != group.CreatedBy() {
		return nil, fmt.Errorf("forbidden Error")
	}

	updatedGroup, err := group.Update(input.Name)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	err = u.gr.Update(ctx, updatedGroup)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.GroupUpdateOutput{
		Group: updatedGroup,
	}, nil
}

func (u GroupUseCaseImpl) AddMember(ctx context.Context, input handler.GroupAddMemberInput) error {
	ctx, span := tracer.Start(ctx, "group.AddMember")
	defer span.End()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	if input.UserID != group.CreatedBy() {
		return fmt.Errorf("forbidden Error")
	}

	err = u.gmr.AddMember(ctx, input.GroupID, input.MemberID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	return nil
}

func (u GroupUseCaseImpl) ListMembers(ctx context.Context, input handler.GroupListMembersInput) (*handler.GroupListMembersOutput, error) {
	ctx, span := tracer.Start(ctx, "group.ListMembers")
	defer span.End()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	if input.UserID != group.CreatedBy() {
		memberIDs, err := u.gmr.FindMembersByGroupID(ctx, input.GroupID)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		authorized := false
		for _, memberID := range memberIDs {
			if memberID == input.UserID {
				authorized = true
				break
			}
		}

		if !authorized {
			return nil, fmt.Errorf("forbidden Error")
		}
	}

	members, err := u.gmr.FindMemberUsersByGroupID(ctx, input.GroupID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.GroupListMembersOutput{
		Members: members,
	}, nil
}

func (u GroupUseCaseImpl) RemoveMember(ctx context.Context, input handler.GroupRemoveMemberInput) error {
	ctx, span := tracer.Start(ctx, "group.RemoveMember")
	defer span.End()

	group, err := u.gr.FindByID(ctx, input.GroupID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	// グループ作成者は誰でも削除可能、メンバーは自身のみ退出可能
	if input.UserID != group.CreatedBy() && input.UserID != input.MemberID {
		return fmt.Errorf("forbidden Error")
	}

	err = u.gmr.RemoveMember(ctx, input.GroupID, input.MemberID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	return nil
}
