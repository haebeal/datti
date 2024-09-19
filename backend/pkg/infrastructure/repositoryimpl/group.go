package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/rs/xid"
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
func (g *groupRepoImpl) GetGroups(c context.Context, uid string) ([]*model.Group, error) {
	groups := make([]*model.Group, 0)
	err := g.DBEngine.Client.NewSelect().
		Table("groups").
		Where("uid = ?", uid).
		Scan(c, groups)
	if err != nil {
		return nil, err
	}

	return groups, nil
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
