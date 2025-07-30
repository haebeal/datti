package repositoryimpl

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/pkg/domain/model"
	"github.com/haebeal/datti/pkg/domain/repository"
	"github.com/haebeal/datti/pkg/infrastructure/database"
)

type groupUserRepositoryImpl struct {
	DBEngine database.DBClient
}

func (g *groupUserRepositoryImpl) GetGroupUser(c context.Context, groupID uuid.UUID, userID uuid.UUID) (*model.GroupUser, error) {
	groupUser := &model.GroupUser{}
	err := g.DBEngine.Client.NewSelect().
		Table("group_users").
		Where("group_id = ?", groupID).
		Where("user_id = ?", userID).
		Scan(c, groupUser)
	if err != nil {
		return nil, err
	}

	return groupUser, nil
}

// GetGroupUserById implements repository.GroupUserReopsitory.
func (g *groupUserRepositoryImpl) GetGroupUserById(c context.Context, id uuid.UUID) ([]*model.GroupUser, error) {
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
func (g *groupUserRepositoryImpl) GetGroupUserByUid(c context.Context, uid uuid.UUID) ([]*model.GroupUser, error) {
	groupUsers := new([]*model.GroupUser)
	err := g.DBEngine.Client.NewSelect().
		Table("group_users").
		Where("user_id = ?", uid).
		Scan(c, groupUsers)
	if err != nil {
		return nil, err
	}

	return *groupUsers, nil
}

// CreateGroupUser implements repository.GroupUserReopsitory.
func (g *groupUserRepositoryImpl) CreateGroupUser(c context.Context, uid uuid.UUID, id uuid.UUID) error {
	groupUser := &model.GroupUser{
		UserID:  uid,
		GroupID: id,
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
func (g *groupUserRepositoryImpl) DeleteGroupUser(c context.Context, uid uuid.UUID, id uuid.UUID) error {
	groupUser := new(model.GroupUser)
	_, err := g.DBEngine.Client.NewDelete().
		Model(groupUser).
		Where("user_id = ? AND group_id = ?", uid, id).
		Exec(c)
	if err != nil {
		return err
	}

	return nil
}

// UpdateGroupUser implements repository.GroupUserReopsitory.
func (g *groupUserRepositoryImpl) UpdateGroupUser(c context.Context, uid uuid.UUID, id uuid.UUID) error {
	groupUser := new(model.GroupUser)
	_, err := g.DBEngine.Client.NewUpdate().
		Model(groupUser).
		Where("user_id = ? AND group_id = ?", uid, id).
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
