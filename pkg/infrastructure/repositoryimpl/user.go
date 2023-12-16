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

// CreatUserはrepository.UserRepository.CreatUserの実装
func (u *userRepoImpl) CreatUser(c context.Context, name string, email string, photoUrl string, accountCode string, bankCode string, branchCode string) (*model.User, error) {
	newUser := &model.User{
		Name:        name,
		Email:       email,
		PhotoURL:    photoUrl,
		AccountCode: accountCode,
		BankCode:    bankCode,
		BranchCode:  bankCode,
	}

	// ユーザーの登録
	result := u.DBEngine.Engine.Create(&newUser)
	if result.Error != nil {
		return nil, result.Error
	}

	return newUser, nil
}

// GetUserはrepository.UserRepository.GetUserの実装
func (u *userRepoImpl) GetUser(c context.Context) (*model.User, error) {
	panic("unimplemented")
}

// UpdateUserはrepository.UserRepository.UpdateUserの実装
func (u *userRepoImpl) UpdateUser(c context.Context, id int, name string, email string, photoUrl string, accountCode string, bankCode string, branchCode string) (*model.User, error) {
	panic("unimplemented")
}

func NewUserRepoImpl(engine *database.DBEngine) repository.UserRepository {
	return &userRepoImpl{
		DBEngine: engine,
	}
}
