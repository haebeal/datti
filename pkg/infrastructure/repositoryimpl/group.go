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

func NewGropuRepoImpl(engine *database.DBClient) repository.GroupRepository {
	return &groupRepoImpl{
		DBEngine: engine,
	}
}

// CreatGroup implements repository.GroupRepository.
func (gr *groupRepoImpl) CreatGroup(c context.Context, group *model.Group, owner *model.User, members []*model.User) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// GetGroupById implements repository.GroupRepository.
func (gr *groupRepoImpl) GetGroupById(c context.Context, id int) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// GetGroups implements repository.GroupRepository.
func (gr *groupRepoImpl) GetGroups(c context.Context, user *model.User) ([]*model.Group, error) {
	panic("unimplemented")
}

// UpdateGroup implements repository.GroupRepository.
func (gr *groupRepoImpl) UpdateGroup(c context.Context, members []*model.User, gropu *model.Group) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}
