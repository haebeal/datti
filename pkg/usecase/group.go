package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type GroupUseCase interface {
	CreateGroup(c context.Context, group *model.Group, owner *model.User, members []*model.User) (*model.Group, []*model.User, error)
	GetGroupById(c context.Context, id int) (*model.Group, []*model.User, error)
	GetGroups(c context.Context) ([]*model.Group, error)
	UpdateGroup(c context.Context, members []*model.User, group *model.Group) (*model.Group, []*model.User, error)
}

type groupUseCase struct {
	repository repository.GroupRepository
}

func NewGroupUseCase(groupRepo repository.GroupRepository) GroupUseCase {
	return &groupUseCase{
		repository: groupRepo,
	}
}

// CreateGroup implements GroupUseCase.
func (*groupUseCase) CreateGroup(c context.Context, group *model.Group, owner *model.User, members []*model.User) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// GetGroupById implements GroupUseCase.
func (*groupUseCase) GetGroupById(c context.Context, id int) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// GetGroups implements GroupUseCase.
func (*groupUseCase) GetGroups(c context.Context) ([]*model.Group, error) {
	panic("unimplemented")
}

// UpdateGroup implements GroupUseCase.
func (*groupUseCase) UpdateGroup(c context.Context, members []*model.User, group *model.Group) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}
