package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type GroupUseCase interface {
	GetGroups(c context.Context) ([]*model.Group, error)
	CreateGroup(c context.Context, name string, owner string, members []string) (*model.Group, []*model.User, error)
	GetGroupById(c context.Context, id string) (*model.Group, []*model.User, error)
	UpdateGroup(c context.Context, members []*model.User, group *model.Group) (*model.Group, []*model.User, error)
	RegisterdMembers(c context.Context, id string, members []string) (*model.Group, []*model.User, error)
}

type groupUseCase struct {
	groupRepository repository.GroupRepository
	userRepository  repository.UserRepository
	transaction     repository.Transaction
}

// CreateGroup implements GroupUseCase.
func (g *groupUseCase) CreateGroup(c context.Context, name string, owner string, members []string) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// GetGroupById implements GroupUseCase.
func (g *groupUseCase) GetGroupById(c context.Context, id string) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// GetGroups implements GroupUseCase.
func (g *groupUseCase) GetGroups(c context.Context) ([]*model.Group, error) {
	panic("unimplemented")
}

// RegisterdMembers implements GroupUseCase.
func (g *groupUseCase) RegisterdMembers(c context.Context, id string, members []string) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// UpdateGroup implements GroupUseCase.
func (g *groupUseCase) UpdateGroup(c context.Context, members []*model.User, group *model.Group) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

func NewGroupUseCase(groupRepo repository.GroupRepository, userRepo repository.UserRepository, tx repository.Transaction) GroupUseCase {
	return &groupUseCase{
		groupRepository: groupRepo,
		userRepository:  userRepo,
		transaction:     tx,
	}
}
