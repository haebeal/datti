package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type UserRepository interface {
	GetUserByUid(c context.Context, uid string) (*model.User, error)
	GetUsers(c context.Context) ([]*model.User, error)
	GetUserByEmail(c context.Context, email string) (*model.User, error)
	GetUsersByEmail(c context.Context, uid string, email string, status string) ([]*model.UserStatus, error)
	UpdateUser(c context.Context, uid string, name string, url string) (*model.User, error)
}
