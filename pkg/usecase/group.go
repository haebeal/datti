package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type GroupUseCase interface {
	GetGroups(c context.Context, uid string) ([]*model.Group, error)
	CreateGroup(c context.Context, name string, owner string, members []string) (*model.Group, []*model.User, error)
	GetGroupById(c context.Context, id string) (*model.Group, []*model.User, error)
	UpdateGroup(c context.Context, id string, name string) (*model.Group, []*model.User, error)
	RegisterdMembers(c context.Context, id string, members []string) (*model.Group, []*model.User, error)
}

type groupUseCase struct {
	groupRepository     repository.GroupRepository
	userRepository      repository.UserRepository
	groupUserRepository repository.GroupUserReopsitory
	transaction         repository.Transaction
}

// CreateGroup implements GroupUseCase.
func (g *groupUseCase) CreateGroup(c context.Context, name string, owner string, members []string) (*model.Group, []*model.User, error) {
	v, err := g.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		group, err := g.groupRepository.CreatGroup(c, name)
		if err != nil {
			return nil, err
		}
		members = append(members, owner)
		for _, member := range members {
			err := g.groupUserRepository.CreateGroupUser(c, member, group.ID)
			if err != nil {
				return nil, err
			}
		}
		return group, nil
	})
	if err != nil {
		return nil, nil, err
	}
	group := v.(*model.Group)
	users := make([]*model.User, 0)
	for _, member := range members {
		user, err := g.userRepository.GetUserByUid(c, member)
		if err != nil {
			return nil, nil, err
		}
		users = append(users, user)
	}

	return group, users, nil
}

// GetGroupById implements GroupUseCase.
func (g *groupUseCase) GetGroupById(c context.Context, id string) (*model.Group, []*model.User, error) {
	group, err := g.groupRepository.GetGroupById(c, id)
	if err != nil {
		return nil, nil, err
	}
	groupUsers, err := g.groupUserRepository.GetGroupUserById(c, group.ID)
	if err != nil {
		return nil, nil, err
	}
	users := make([]*model.User, 0)
	for _, groupUser := range groupUsers {
		user, err := g.userRepository.GetUserByUid(c, groupUser.UserID)
		if err != nil {
			return nil, nil, err
		}
		users = append(users, user)
	}

	return group, users, nil
}

// GetGroups implements GroupUseCase.
func (g *groupUseCase) GetGroups(c context.Context, uid string) ([]*model.Group, error) {
	groupUsers, err := g.groupUserRepository.GetGroupUserByUid(c, uid)
	if err != nil {
		return nil, err
	}
	groups := make([]*model.Group, 0)
	for _, groupUser := range groupUsers {
		group, err := g.groupRepository.GetGroupById(c, groupUser.GroupID)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

// RegisterdMembers implements GroupUseCase.
func (g *groupUseCase) RegisterdMembers(c context.Context, id string, members []string) (*model.Group, []*model.User, error) {
	_, err := g.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		for _, member := range members {
			err := g.groupUserRepository.CreateGroupUser(c, member, id)
			if err != nil {
				return nil, err
			}
		}
		return nil, nil
	})
	if err != nil {
		return nil, nil, err
	}
	group, err := g.groupRepository.GetGroupById(c, id)
	if err != nil {
		return nil, nil, err
	}
	groupUsers, err := g.groupUserRepository.GetGroupUserById(c, group.ID)
	if err != nil {
		return nil, nil, err
	}
	users := make([]*model.User, 0)
	for _, u := range groupUsers {
		user, err := g.userRepository.GetUserByUid(c, u.UserID)
		if err != nil {
			return nil, nil, err
		}
		users = append(users, user)
	}

	return group, users, nil
}

// UpdateGroup implements GroupUseCase.
func (g *groupUseCase) UpdateGroup(c context.Context, id string, name string) (*model.Group, []*model.User, error) {
	v, err := g.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		group, err := g.groupRepository.UpdateGroup(c, id, name)
		if err != nil {
			return nil, err
		}
		return group, nil
	})
	if err != nil {
		return nil, nil, err
	}
	group := v.(*model.Group)
	groupUsers, err := g.groupUserRepository.GetGroupUserById(c, group.ID)
	if err != nil {
		return nil, nil, err
	}
	users := make([]*model.User, 0)
	for _, groupUser := range groupUsers {
		user, err := g.userRepository.GetUserByUid(c, groupUser.UserID)
		if err != nil {
			return nil, nil, err
		}
		users = append(users, user)
	}

	return group, users, nil
}

func NewGroupUseCase(groupRepo repository.GroupRepository, userRepo repository.UserRepository, groupUserRepo repository.GroupUserReopsitory, tx repository.Transaction) GroupUseCase {
	return &groupUseCase{
		groupRepository:     groupRepo,
		userRepository:      userRepo,
		groupUserRepository: groupUserRepo,
		transaction:         tx,
	}
}
