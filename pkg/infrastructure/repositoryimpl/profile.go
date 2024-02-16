package repositoryimpl

import (
	"context"

	"firebase.google.com/go/v4/auth"
	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type profileRepoImpl struct {
	TenantClient database.FireBaseTenantClient
}

// GetProfile implements repository.ProfileRepository.
func (pr *profileRepoImpl) GetProfile(c context.Context, idToken string, uid string) (*model.Profile, error) {
	profile := new(model.Profile)
	u, err := pr.TenantClient.Client.GetUser(c, uid)
	if err != nil {
		return nil, err
	}

	profile.ID = u.UID
	profile.Name = u.DisplayName
	profile.PhotoUrl = u.PhotoURL

	return profile, nil
}

// GetProfileByEmail implements repository.ProfileRepository.
func (pr *profileRepoImpl) GetProfileByEmail(c context.Context, idToken string, email string) (*model.Profile, error) {
	profile := new(model.Profile)
	u, err := pr.TenantClient.Client.GetUserByEmail(c, email)
	if err != nil {
		return nil, err
	}
	
	profile.ID = u.UID
	profile.Name = u.DisplayName
	profile.PhotoUrl = u.PhotoURL

	return profile, nil
}

// UpdateName implements repository.ProfileRepository.
func (pr *profileRepoImpl) UpdateProfile(c context.Context, idToken string, uid string, name string, url string) (*model.Profile, error) {
	updateProfile := new(model.Profile)
	updateUser := new(auth.UserToUpdate)
	updateUser.DisplayName(name)
	updateUser.PhotoURL(url)
	u, err := pr.TenantClient.Client.UpdateUser(c, uid, updateUser)
	if err != nil {
		return nil, err
	}

	updateProfile.ID = u.UID
	updateProfile.Name = u.DisplayName
	updateProfile.PhotoUrl = u.PhotoURL

	return updateProfile, nil
}

func NewProfileRepoImpl(client *database.FireBaseTenantClient) repository.ProfileRepository {
	return &profileRepoImpl{
		TenantClient: *client,
	}
}
