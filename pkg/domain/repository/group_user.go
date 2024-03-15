package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type GroupUserReopsitory interface {
	CreateGroupUser(c context.Context, uid string, id string) error
	GetGroupUserByUid(c context.Context, uid string) ([]*model.GroupUser, error)
	GetGroupUserById(c context.Context, id string) ([]*model.GroupUser, error)
	UpdateGroupUser(c context.Context, uid string, id string) error
	DeleteGroupUser(c context.Context, uid string, id string) error
}
