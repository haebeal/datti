package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type GroupUseCase interface {
	GetGroups(c context.Context, uid string) ([]*model.Group, error)
	CreateGroup(c context.Context, name string, userID string, members []string) (*model.Group, []*model.User, []*string, error)
	GetGroupById(c context.Context, id string) (*model.Group, error)
	GetMembers(c context.Context, id string, uid string, status string) ([]*model.User, []*string, error)
	UpdateGroup(c context.Context, id string, name string) (*model.Group, []*model.User, error)
	RegisterdMembers(c context.Context, userID string, id string, members []string) (*model.Group, []*model.User, []*string, error)
}

type groupUseCase struct {
	groupRepository     repository.GroupRepository
	userRepository      repository.UserRepository
	friendRepository    repository.FriendRepository
	groupUserRepository repository.GroupUserReopsitory
	transaction         repository.Transaction
}

// CreateGroup implements GroupUseCase.
func (g *groupUseCase) CreateGroup(c context.Context, name string, userID string, members []string) (*model.Group, []*model.User, []*string, error) {
	v, err := g.transaction.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		group, err := g.groupRepository.CreatGroup(c, name)
		if err != nil {
			return nil, err
		}
		members = append(members, userID)
		for _, member := range members {
			err := g.groupUserRepository.CreateGroupUser(c, member, group.ID)
			if err != nil {
				return nil, err
			}
		}
		return group, nil
	})
	if err != nil {
		return nil, nil, nil, err
	}
	group := v.(*model.Group)
	users := make([]*model.User, 0)
	statuses := make([]*string, 0)

	for _, member := range members {
		user, err := g.userRepository.GetUserByUid(c, member)
		if err != nil {
			return nil, nil, nil, err
		}
		status, err := g.friendRepository.GetStatus(c, userID, user.ID)
		if err != nil {
			return nil, nil, nil, err
		}
		users = append(users, user)
		statuses = append(statuses, &status)
	}

	return group, users, statuses, nil
}

// GetGroupById implements GroupUseCase.
func (g *groupUseCase) GetGroupById(c context.Context, id string) (*model.Group, error) {
	group, err := g.groupRepository.GetGroupById(c, id)
	if err != nil {
		return nil, err
	}

	return group, nil
}

// GetMembers implements GroupUseCase.
func (g *groupUseCase) GetMembers(c context.Context, id string, uid string, status string) ([]*model.User, []*string, error) {
	group, err := g.groupRepository.GetGroupById(c, id)
	if err != nil {
		return nil, nil, err
	}
	groupUsers, err := g.groupUserRepository.GetGroupUserById(c, group.ID)
	if err != nil {
		return nil, nil, err
	}
	users := make([]*model.User, 0)
	statuses := make([]*string, 0)
	for _, groupUser := range groupUsers {
		user, err := g.userRepository.GetUserByUid(c, groupUser.UserID)
		if err != nil {
			return nil, nil, err
		}

		s, err := g.friendRepository.GetStatus(c, uid, groupUser.UserID)
		if err != nil {
			return nil, nil, err
		}

		if status != "" {
			if s == status {
				statuses = append(statuses, &s)
				users = append(users, user)
			}
		} else {
			statuses = append(statuses, &s)
			users = append(users, user)
		}
	}

	return users, statuses, nil
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
func (g *groupUseCase) RegisterdMembers(c context.Context, userID string, id string, members []string) (*model.Group, []*model.User, []*string, error) {
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
		return nil, nil, nil, err
	}
	group, err := g.groupRepository.GetGroupById(c, id)
	if err != nil {
		return nil, nil, nil, err
	}

	// 登録したユーザーを取得
	users := make([]*model.User, 0)
	for _, member := range members {
		user, err := g.userRepository.GetUserByUid(c, member)
		if err != nil {
			return nil, nil, nil, err
		}
		users = append(users, user)
	}

	// 登録したユーザーのステータスを取得
	statuses := make([]*string, 0)
	for _, u := range users {
		status, err := g.friendRepository.GetStatus(c, userID, u.ID)
		if err != nil {
			return nil, nil, nil, err
		}
		statuses = append(statuses, &status)
	}

	return group, users, statuses, nil
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

func NewGroupUseCase(groupRepo repository.GroupRepository, userRepo repository.UserRepository, friendRepo repository.FriendRepository, groupUserRepo repository.GroupUserReopsitory, tx repository.Transaction) GroupUseCase {
	return &groupUseCase{
		groupRepository:     groupRepo,
		userRepository:      userRepo,
		friendRepository:    friendRepo,
		groupUserRepository: groupUserRepo,
		transaction:         tx,
	}
}
