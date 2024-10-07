package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type GroupRepository interface {
	GetGroups(c context.Context) ([]*model.Group, error)
	GetGroupsByUid(c context.Context, uid string, cursor string, limit int, getNext bool) ([]*model.Group, *model.Cursor, error)
	CreatGroup(c context.Context, name string) (*model.Group, error)
	GetGroupById(c context.Context, id string) (*model.Group, error)
	UpdateGroup(c context.Context, id string, name string) (*model.Group, error)
}
