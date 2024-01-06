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
	err := validator.ValidatorEmail(user.Email)
	if err != nil {
		return nil, err
	}

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
	err := validator.ValidatorName(user.Name)
	if err != nil {
		return nil, err
	}

	updateUser, err := uu.repository.UpdateUser(c, user)
	if err != nil {
		return nil, err
	}

	return updateUser, nil
}
