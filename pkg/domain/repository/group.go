package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type GroupRepository interface {
	GetGroups(c context.Context, uid string) ([]*model.Group, error)
	CreatGroup(c context.Context, name string, owner string, members []string) (*model.Group, []*model.User, error)
	GetGroupById(c context.Context, id string) (*model.Group, []*model.User, error)
	UpdateGroup(c context.Context, id string, name string) (*model.Group, []*model.User, error)
	RegisterdMembers(c context.Context, id string, members []string) (*model.Group, []*model.User, error)
}
