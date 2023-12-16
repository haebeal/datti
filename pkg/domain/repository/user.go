package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type UserRepository interface {
	CreatUser(c context.Context, user *model.User) (*model.User, error)
	GetUser(c context.Context) (*model.User, error)
	UpdateUser(c context.Context, user *model.User) (*model.User, error)
}
