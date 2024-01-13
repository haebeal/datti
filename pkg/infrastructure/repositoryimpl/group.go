package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type groupRepoImpl struct {
	DBEngine *database.DBEngine
}

func NewGropuRepoImpl(engine *database.DBEngine) repository.GroupRepository {
	return &groupRepoImpl{
		DBEngine: engine,
	}
}

// Creat implements repository.GroupRepository.
func (*groupRepoImpl) Creat(c context.Context, group *model.Group, owner *model.User, members []*model.User) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// Get implements repository.GroupRepository.
func (*groupRepoImpl) Get(c context.Context, user *model.User) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}

// Update implements repository.GroupRepository.
func (*groupRepoImpl) Update(c context.Context, members []*model.User, gropu *model.Group) (*model.Group, []*model.User, error) {
	panic("unimplemented")
}
