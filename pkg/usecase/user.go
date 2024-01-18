package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/validator"
)

type UserUseCase interface {
	CreateUser(c context.Context, user *model.User) (*model.User, error)
	GetUser(c context.Context, id int) (*model.User, error)
	GetUserByEmail(c context.Context, user *model.User) (*model.User, error)
	UpdateUser(c context.Context, user *model.User) (*model.User, error)
}

type userUseCase struct {
	repository repository.UserRepository
}

func NewUserUseCase(userRepo repository.UserRepository) UserUseCase {
	return &userUseCase{
		repository: userRepo,
	}
}

// Create implements UserUseCase.
func (uu *userUseCase) CreateUser(c context.Context, user *model.User) (*model.User, error) {
	// メールアドレスとユーザー名の値を検査する
	if err := validator.ValidatorEmail(user.Email); err != nil {
		return nil, err
	}
	// if err := validator.ValidatorName(user.Name); err != nil {
	// 	return nil, err
	// }

	newUser, err := uu.repository.CreatUser(c, user)
	if err != nil {
		return nil, err
	}

	return newUser, nil
}

// GetUser implements UserUseCase.
func (uu *userUseCase) GetUser(c context.Context, id int) (*model.User, error) {
	panic("unimplemented")
}

// Emailでユーザー情報を取得する
func (uu *userUseCase) GetUserByEmail(c context.Context, user *model.User) (*model.User, error) {
	findUser, err := uu.repository.GetUserByEmail(c, user)
	if err != nil {
		return nil, err
	}

	return findUser, nil
}

// UpdateUser implements UserUseCase.
func (uu *userUseCase) UpdateUser(c context.Context, user *model.User) (*model.User, error) {
	// 各フィールドの値が存在するかを確認する
	// 値が存在する場合は検査を行う
	// if val, exists := updateFields["Name"]; exists {
	// 	if err := validator.ValidatorName(val.(string)); err != nil {
	// 		return nil, err
	// 	}
	// }
	// if val, exists := updateFields["PhotoUrl"]; exists {
	// 	if err := validator.ValidatorPhotoUrl(val.(string)); err != nil {
	// 		return nil, err
	// 	}
	// }
	// if val, exists := updateFields["AccountCode"]; exists {
	// 	if err := validator.ValidatorAccountCode(val.(string)); err != nil {
	// 		return nil, err
	// 	}
	// }
	// if val, exists := updateFields["BankCode"]; exists {
	// 	if err := validator.ValidatorBankCode(val.(string)); err != nil {
	// 		return nil, err
	// 	}
	// }
	// if val, exists := updateFields["BranchCode"]; exists {
	// 	if err := validator.ValidatorBranchCode(val.(string)); err != nil {
	// 		return nil, err
	// 	}
	// }

	updateUser, err := uu.repository.UpdateUser(c, user)
	if err != nil {
		return nil, err
	}

	return updateUser, nil
}
