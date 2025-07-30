package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/pkg/domain/model"
)

type GroupRepository interface {
	GetGroups(c context.Context, uid uuid.UUID) ([]*model.Group, error)
	CreatGroup(c context.Context, name string) (*model.Group, error)
	GetGroupById(c context.Context, id uuid.UUID) (*model.Group, error)
	GetGroupsByUid(c context.Context, uid uuid.UUID, cursor uuid.UUID, limit int, getNext bool) ([]*model.Group, *model.Cursor, error)
	DeleteGroupById(c context.Context, id uuid.UUID) error
	UpdateGroup(c context.Context, id uuid.UUID, name string) (*model.Group, error)
}
