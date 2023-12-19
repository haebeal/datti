package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type userRepoImpl struct {
	DBEngine *database.DBEngine
}

func NewUserRepoImpl(engine *database.DBEngine) repository.UserRepository {
	return &userRepoImpl{
		DBEngine: engine,
	}
}

// CreatUserはrepository.UserRepository.CreatUserの実装
func (u *userRepoImpl) CreatUser(c context.Context, user *model.User) (*model.User, error) {
	// ユーザーの登録
	result := u.DBEngine.Engine.Create(&user)
	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}

// GetUserはrepository.UserRepository.GetUserの実装
func (u *userRepoImpl) GetUser(c context.Context) (*model.User, error) {
	panic("unimplemented")
}

// UpdateUserはrepository.UserRepository.UpdateUserの実装
func (u *userRepoImpl) UpdateUser(c context.Context, user *model.User) (*model.User, error) {
	panic("unimplemented")
}

// Emailと突合してユーザーを取得
func (u *userRepoImpl) GetUserByEmail(c context.Context, user *model.User) (*model.User, error) {
	// ユーザー情報の取得
	result := u.DBEngine.Engine.Where("email = ?", user.Email).Find(&user)
	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}
