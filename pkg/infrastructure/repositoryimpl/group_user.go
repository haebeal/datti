package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type groupUserRepositoryImpl struct {
	DBEngine database.DBClient
}

// GetGroupUserById implements repository.GroupUserReopsitory.
func (g *groupUserRepositoryImpl) GetGroupUserById(c context.Context, id string) ([]*model.GroupUser, error) {
	groupUsers := new([]*model.GroupUser)
	err := g.DBEngine.Client.NewSelect().
		Table("group_users").
		Where("group_id = ?", id).
		Scan(c, groupUsers)
	if err != nil {
		return nil, err
	}

	return *groupUsers, nil
}

// GetGroupUserByUid implements repository.GroupUserReopsitory.
func (g *groupUserRepositoryImpl) GetGroupUserByUid(c context.Context, uid string) ([]*model.GroupUser, error) {
	groupUsers := new([]*model.GroupUser)
	err := g.DBEngine.Client.NewSelect().
		Table("group_users").
		Where("uid = ?", uid).
		Scan(c, groupUsers)
	if err != nil {
		return nil, err
	}

	return *groupUsers, nil
}

// CreateGroupUser implements repository.GroupUserReopsitory.
func (g *groupUserRepositoryImpl) CreateGroupUser(c context.Context, uid string, id string) error {
	groupUser := &model.GroupUser{
		UserID:  uid,
		GroupID: id,
		Owner:   true,
	}
	_, err := g.DBEngine.Client.NewInsert().
		Model(groupUser).
		Exec(c)
	if err != nil {
		return err
	}

	return nil
}

// DeleteGroupUser implements repository.GroupUserReopsitory.
func (g *groupUserRepositoryImpl) DeleteGroupUser(c context.Context, uid string, id string) error {
	groupUser := new(model.GroupUser)
	_, err := g.DBEngine.Client.NewDelete().
		Model(groupUser).
		Where("uid = ? AND group_id = ?", uid, id).
		Exec(c)
	if err != nil {
		return err
	}

	return nil
}

// UpdateGroupUser implements repository.GroupUserReopsitory.
func (g *groupUserRepositoryImpl) UpdateGroupUser(c context.Context, uid string, id string) error {
	groupUser := new(model.GroupUser)
	_, err := g.DBEngine.Client.NewUpdate().
		Model(groupUser).
		Where("uid = ? AND group_id = ?", uid, id).
		Set("owner = ?", true).
		Exec(c)
	if err != nil {
		return err
	}

	return nil
}

func NewGroupUserRepository(engine *database.DBClient) repository.GroupUserReopsitory {
	return &groupUserRepositoryImpl{
		DBEngine: *engine,
	}
}
