package repositoryimpl

import (
	"context"

	"firebase.google.com/go/v4/auth"
	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type userRepoImpl struct {
	TenantClient database.FireBaseTenantClient
}

// GetProfile implements repository.ProfileRepository.
func (ur *userRepoImpl) GetUserByUid(c context.Context, uid string) (*model.User, error) {
	user := new(model.User)
	u, err := ur.TenantClient.Client.GetUser(c, uid)
	if err != nil {
		return nil, err
	}

	user.UID = u.UID
	user.Name = u.DisplayName
	user.PhotoUrl = u.PhotoURL

	return user, nil
}

// GetUsers implements repository.ProfileRepository.
func (ur *userRepoImpl) GetUsers(c context.Context) ([]*model.User, error) {
	users := make([]*model.User, 0)
	iter := ur.TenantClient.Client.Users(c, "")
	for {
		user, err := iter.Next()
		if err != nil {
			break
		}
		users = append(users, &model.User{
			UID:      user.UID,
			Name:     user.DisplayName,
			Email:    user.Email,
			PhotoUrl: user.PhotoURL,
		})
	}
	return users, nil
}

// GetProfileByEmail implements repository.ProfileRepository.
func (ur *userRepoImpl) GetUserByEmail(c context.Context, email string) (*model.User, error) {
	user := new(model.User)
	u, err := ur.TenantClient.Client.GetUserByEmail(c, email)
	if err != nil {
		return nil, err
	}

	user.UID = u.UID
	user.Name = u.DisplayName
	user.PhotoUrl = u.PhotoURL

	return user, nil
}

// UpdateName implements repository.ProfileRepository.
func (ur *userRepoImpl) UpdateUser(c context.Context, uid string, name string, url string) (*model.User, error) {
	user := new(model.User)
	updateUser := new(auth.UserToUpdate)
	updateUser.DisplayName(name)
	updateUser.PhotoURL(url)
	u, err := ur.TenantClient.Client.UpdateUser(c, uid, updateUser)
	if err != nil {
		return nil, err
	}

	user.UID = u.UID
	user.Name = u.DisplayName
	user.PhotoUrl = u.PhotoURL

	return user, nil
}

func NewProfileRepoImpl(client *database.FireBaseTenantClient) repository.UserRepository {
	return &userRepoImpl{
		TenantClient: *client,
	}
}
