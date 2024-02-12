package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type profileRepoImpl struct {
	TenantClient database.FireBaseTenantClient
}

// GetProfile implements repository.ProfileRepository.
func (*profileRepoImpl) GetProfile(c context.Context, uid string) (*model.Profile, error) {
	panic("unimplemented")
}

// UpdateName implements repository.ProfileRepository.
func (*profileRepoImpl) UpdateProfile(c context.Context, uid string, string, url string) (*model.Profile, error) {
	panic("unimplemented")
}

func NewProfileRepoImpl(client *database.FireBaseTenantClient) repository.ProfileRepository {
	return &profileRepoImpl{
		TenantClient: *client,
	}
}
