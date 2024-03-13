package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type groupRepoImpl struct {
	DBEngine *database.DBClient
}

// CreatGroup implements repository.GroupRepository.
func (g *groupRepoImpl) CreatGroup(c context.Context, name string, owner string, members []string) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// GetGroupById implements repository.GroupRepository.
func (g *groupRepoImpl) GetGroupById(c context.Context, id string) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// GetGroups implements repository.GroupRepository.
func (g *groupRepoImpl) GetGroups(c context.Context, uid string) ([]*model.Group, error) {
	panic("unimplemented")
}

// UpdateGroup implements repository.GroupRepository.
func (g *groupRepoImpl) UpdateGroup(c context.Context, id string, name string) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// registerdMembers implements repository.GroupRepository.
func (g *groupRepoImpl) RegisterdMembers(c context.Context, id string, members []string) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

func NewGropuRepoImpl(engine *database.DBClient) repository.GroupRepository {
	return &groupRepoImpl{
		DBEngine: engine,
	}
}
