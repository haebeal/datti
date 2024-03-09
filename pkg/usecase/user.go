package usecase

import (
	"context"
	"strings"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
)

type UserUseCase interface {
	GetUsers(c context.Context, uid string) ([]*model.User, error)
	GetUserByUid(c context.Context, uid string) (*model.User, error)
	GetUsersByEmail(c context.Context, email string) ([]*model.User, error)
	UpdateUser(c context.Context, uid string, name string, url string) (*model.User, error)
}

type userUseCase struct {
	repository repository.UserRepository
}

// GetUserByEmail implements UserUseCase.
func (u *userUseCase) GetUsersByEmail(c context.Context, email string) ([]*model.User, error) {
	users, err := u.repository.GetUsers(c)
	if err != nil {
		return nil, err
	}
	usersWithEmail := make([]*model.User, 0)
	for _, user := range users {
		if strings.Contains(user.Email, email) {
			usersWithEmail = append(usersWithEmail, user)
		}
	}

	return usersWithEmail, nil
}

// GetUserByUid implements UserUseCase.
func (u *userUseCase) GetUserByUid(c context.Context, uid string) (*model.User, error) {
	user, err := u.repository.GetUserByUid(c, uid)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUsers implements UserUseCase.
func (u *userUseCase) GetUsers(c context.Context, uid string) ([]*model.User, error) {
	users, err := u.repository.GetUsers(c)
	if err != nil {
		return nil, err
	}

	return users, nil
}

// UpdateUser implements UserUseCase.
func (u *userUseCase) UpdateUser(c context.Context, uid string, name string, url string) (*model.User, error) {
	user, err := u.repository.UpdateUser(c, uid, name, url)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func NewUserUseCase(userRepo repository.UserRepository) UserUseCase {
	return &userUseCase{
		repository: userRepo,
	}
}
