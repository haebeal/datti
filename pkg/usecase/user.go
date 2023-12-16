package usecase

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type UserUseCase interface {
	CreateUser(c context.Context, name string, email string, photoUrl string, accountCode string, bankCode string, branchCode string) (*model.User, error)
	GetUser(c context.Context, id int) (*model.User, error)
	UpdateUser(c context.Context, id int, name string, email string, photoUrl string, accountCode string, bankCode string, branchCode string)
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
func (uu *userUseCase) CreateUser(c context.Context, name string, email string, photoUrl string, accountCode string, bankCode string, branchCode string) (*model.User, error) {
	newUser, err := uu.repository.CreatUser(c, name, email, photoUrl, accountCode, bankCode, branchCode)
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
func (uu *userUseCase) UpdateUser(c context.Context, id int, name string, email string, photoUrl string, accountCode string, bankCode string, branchCode string) {
	panic("unimplemented")
}
