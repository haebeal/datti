package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/rs/xid"
	"github.com/uptrace/bun"
)

type groupRepoImpl struct {
	DBEngine *database.DBClient
}

// CreatGroup implements repository.GroupRepository.
func (g *groupRepoImpl) CreatGroup(c context.Context, name string) (*model.Group, error) {
	id := xid.New()
	group := &model.Group{
		ID:   id.String(),
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
func (g *groupRepoImpl) GetGroupById(c context.Context, id string) (*model.Group, error) {
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
func (g *groupRepoImpl) GetGroups(c context.Context) ([]*model.Group, error) {
	groups := new([]*model.Group)
	err := g.DBEngine.Client.NewSelect().
		Table("groups").
		Scan(c, groups)
	if err != nil {
		return nil, err
	}

	return *groups, nil
}

// GetGroups implements repository.GroupRepository.
func (g *groupRepoImpl) GetGroupsByUid(c context.Context, uid string, cursor string, limit int, getNext bool) ([]*model.Group, *model.Cursor, error) {
	groups := new([]*model.Group)
	var query *bun.SelectQuery
	if getNext {
		query = g.DBEngine.Client.NewSelect().
			Table("groups").
			ColumnExpr("groups.*").
			Join("INNER JOIN group_users ON groups.id = group_users.group_id").
			Where("group_users.uid = ?", uid).
			Where("id > ?", cursor).
			OrderExpr("id ASC").
			Limit(limit)
	} else {
		query = g.DBEngine.Client.NewSelect().
			Table("groups").
			ColumnExpr("groups.*").
			Join("INNER JOIN group_users ON groups.id = group_users.group_id").
			Where("group_users.uid = ?", uid).
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
func (g *groupRepoImpl) UpdateGroup(c context.Context, id string, name string) (*model.Group, error) {
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
