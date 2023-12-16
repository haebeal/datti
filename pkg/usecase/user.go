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
	UpdateUser(c context.Context, user *model.User)
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

// UpdateUser implements UserUseCase.
func (uu *userUseCase) UpdateUser(c context.Context, user *model.User) {
	panic("unimplemented")
}
