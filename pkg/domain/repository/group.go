package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type GroupRepository interface {
	CreatGroup(c context.Context, name string, owner string, members []string) (*model.Group, []*model.User, error)
	GetGroupById(c context.Context, id string) (*model.Group, []*model.User, error)
	GetGroups(c context.Context, uid string) ([]*model.Group, error)
	UpdateGroup(c context.Context, id string, name string, members []string) (*model.Group, []*model.User, error)
}
