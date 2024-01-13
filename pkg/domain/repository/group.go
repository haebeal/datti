package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type GroupRepository interface {
	Creat(c context.Context, group *model.Group, owner *model.User, members []*model.User) (*model.Group, []*model.User, error)
	Get(c context.Context, user *model.User) (*model.Group, []*model.User, error)
	Update(c context.Context, members []*model.User, gropu *model.Group) (*model.Group, []*model.User, error)
	//Delete()
}
