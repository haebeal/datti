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

	group, err := domain.CreateGroup(input.Name, input.OwnerID)
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

	err = u.gmr.AddMember(ctx, group.ID(), group.OwnerID())
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

	if input.UserID != group.OwnerID() {
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

	if input.UserID != group.OwnerID() {
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
