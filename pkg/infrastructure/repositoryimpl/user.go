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
	// トランザクションを生成
	tx := u.DBEngine.Engine.WithContext(c).Begin()
	// エラーの発生した際にロールバックを行う
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	// ユーザーの登録
	result := tx.Create(&user)
	if result.Error != nil {
		return nil, result.Error
	}

	//トランザクションのコミット
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return user, nil
}
