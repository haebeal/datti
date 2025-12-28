package usecase

import (
	"context"

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
