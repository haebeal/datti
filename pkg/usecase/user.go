package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type UserUseCase interface {
	CreateUser(c context.Context, user *model.User) (*model.User, error)
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
	newUser, err := uu.repository.CreatUser(c, user)
	if err != nil {
		return nil, err
	}

	return newUser, nil
}
