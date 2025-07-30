package repositoryimpl

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/pkg/domain/model"
	"github.com/haebeal/datti/pkg/domain/repository"
	"github.com/haebeal/datti/pkg/infrastructure/database"
	"github.com/uptrace/bun"
)

type groupRepoImpl struct {
	DBEngine *database.DBClient
}

// DeleteGroupById implements repository.GroupRepository.
func (g *groupRepoImpl) DeleteGroupById(c context.Context, id uuid.UUID) error {
	_, err := g.DBEngine.Client.NewDelete().
		Table("groups").
		Where("id = ?", id).
		Exec(c)
	if err != nil {
		return err
	}

	return nil
}

// CreatGroup implements repository.GroupRepository.
func (g *groupRepoImpl) CreatGroup(c context.Context, name string) (*model.Group, error) {
	group := &model.Group{
		Name: name,
	}
	_, err := g.DBEngine.Client.NewInsert().
		Model(group).
		Exec(c)
	if err != nil {
		return nil, err
	}

	return group, nil
}

// GetGroupById implements repository.GroupRepository.
func (g *groupRepoImpl) GetGroupById(c context.Context, id uuid.UUID) (*model.Group, error) {
	group := new(model.Group)
	err := g.DBEngine.Client.NewSelect().
		Table("groups").
		Where("id = ?", id).
		Scan(c, group)
	if err != nil {
		return nil, err
	}

	return group, nil
}

// GetGroups implements repository.GroupRepository.
func (g *groupRepoImpl) GetGroups(c context.Context, uid uuid.UUID) ([]*model.Group, error) {
	groups := make([]*model.Group, 0)
	err := g.DBEngine.Client.NewSelect().
		Table("groups").
		Where("user_id = ?", uid).
		Scan(c, groups)
	if err != nil {
		return nil, err
	}

	return groups, nil
}

// GetGroups implements repository.GroupRepository.
func (g *groupRepoImpl) GetGroupsByUid(c context.Context, uid uuid.UUID, cursor uuid.UUID, limit int, getNext bool) ([]*model.Group, *model.Cursor, error) {
	groups := new([]*model.Group)
	var query *bun.SelectQuery
	if getNext {
		query = g.DBEngine.Client.NewSelect().
			Table("groups").
			ColumnExpr("groups.*").
			Join("INNER JOIN group_users ON groups.id = group_users.group_id").
			Where("group_users.user_id = ?", uid).
			Where("id > ?", cursor).
			OrderExpr("id ASC").
			Limit(limit)
	} else {
		query = g.DBEngine.Client.NewSelect().
			Table("groups").
			ColumnExpr("groups.*").
			Join("INNER JOIN group_users ON groups.id = group_users.group_id").
			Where("group_users.user_id = ?", uid).
			Where("id < ?", cursor).
			OrderExpr("id DESC").
			Limit(limit)
	}

	err := query.Scan(c, groups)
	if err != nil {
		return nil, nil, err
	}

	return *groups, newGroupsCursor(*groups), nil
}

// UpdateGroup implements repository.GroupRepository.
func (g *groupRepoImpl) UpdateGroup(c context.Context, id uuid.UUID, name string) (*model.Group, error) {
	group := new(model.Group)
	group.ID = id
	group.Name = name
	_, err := g.DBEngine.Client.NewUpdate().
		Model(group).
		Column("name").
		Where("id = ?", id).
		Exec(c)
	if err != nil {
		return nil, err
	}

	return group, nil
}

func NewGropuRepoImpl(engine *database.DBClient) repository.GroupRepository {
	return &groupRepoImpl{
		DBEngine: engine,
	}
}

func newGroupsCursor(groups []*model.Group) *model.Cursor {
	if len(groups) == 0 {
		return &model.Cursor{}
	}
	return &model.Cursor{
		Start: groups[0].ID,
		End:   groups[len(groups)-1].ID,
	}
}
