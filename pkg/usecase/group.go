package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type GroupUseCase interface {
	Create(c context.Context, group *model.Group, owner *model.User, members []*model.User) (*model.Group, []*model.User, error)
	Get(c context.Context, user *model.User) (*model.Group, []*model.User, error)
	Update(c context.Context, members []*model.User, group *model.Group) (*model.Group, []*model.User, error)
}

type groupUseCase struct {
	repository repository.GroupRepository
}

func NewGroupUseCase(groupRepo repository.GroupRepository) GroupUseCase {
	return &groupUseCase{
		repository: groupRepo,
	}
}

// Create implements GroupUseCase.
func (*groupUseCase) Create(c context.Context, group *model.Group, owner *model.User, members []*model.User) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// Get implements GroupUseCase.
func (*groupUseCase) Get(c context.Context, user *model.User) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// Update implements GroupUseCase.
func (*groupUseCase) Update(c context.Context, members []*model.User, group *model.Group) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}
