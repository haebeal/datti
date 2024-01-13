package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type GroupRepository interface {
	CreatGroup(c context.Context, group *model.Group, owner *model.User, members []*model.User) (*model.Group, []*model.User, error)
	GetGroupById(c context.Context, id int) (*model.Group, []*model.User, error)
	GetGroups(c context.Context, user *model.User) ([]*model.Group, error)
	UpdateGroup(c context.Context, members []*model.User, gropu *model.Group) (*model.Group, []*model.User, error)
	//Delete()
}
