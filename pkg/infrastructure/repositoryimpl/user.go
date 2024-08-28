package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type userRepoImpl struct {
	// TenantClient database.FireBaseTenantClient
	DBEngine database.DBClient
}

// GetProfile implements repository.ProfileRepository.
func (ur *userRepoImpl) GetUserByUid(c context.Context, uid string) (*model.User, error) {
	user := new(model.User)
	err := ur.DBEngine.Client.NewSelect().
		Table("users").
		Where("id = ?", uid).
		Scan(c, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUsers implements repository.ProfileRepository.
func (ur *userRepoImpl) GetUsers(c context.Context) ([]*model.User, error) {
	users := make([]*model.User, 0)
	err := ur.DBEngine.Client.NewSelect().
		Table("users").
		Scan(c, users)
	if err != nil {
		return nil, err
	}

	return users, nil
}

// GetProfileByEmail implements repository.ProfileRepository.
func (ur *userRepoImpl) GetUserByEmail(c context.Context, email string) (*model.User, error) {
	user := new(model.User)
	err := ur.DBEngine.Client.NewSelect().
		Table("users").
		Where("email = ?", email).
		Scan(c, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// UpdateName implements repository.ProfileRepository.
func (ur *userRepoImpl) UpdateUser(c context.Context, uid string, name string, url string) (*model.User, error) {
	user := new(model.User)
	user.ID = uid
	user.Name = name
	user.PhotoUrl = url

	_, err := ur.DBEngine.Client.NewUpdate().
		Model(user).
		Where("id = ?", uid).
		Exec(c)
	if err != nil {
		return nil, err
	}

	err = ur.DBEngine.Client.NewSelect().
		Table("users").
		Where("id = ?", uid).
		Scan(c, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func NewProfileRepoImpl(engine *database.DBClient) repository.UserRepository {
	return &userRepoImpl{
		DBEngine: *engine,
	}
}
