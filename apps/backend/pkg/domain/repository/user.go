package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/pkg/domain/model"
)

type UserRepository interface {
	GetUserByUid(c context.Context, uid uuid.UUID) (*model.User, error)
	GetUsers(c context.Context) ([]*model.User, error)
	GetUserByEmail(c context.Context, email string) (*model.User, error)
	GetUsersByEmail(c context.Context, uid uuid.UUID, email string, status string, cursor string, limit int, getNext bool) ([]*model.UserStatus, *model.Cursor, error)
	UpdateUser(c context.Context, uid uuid.UUID, name string, url string) (*model.User, error)
}
