package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/google/uuid"
)

type GroupRepository interface {
	GetGroups(c context.Context, uid uuid.UUID) ([]*model.Group, error)
	CreatGroup(c context.Context, name string) (*model.Group, error)
	GetGroupById(c context.Context, id uuid.UUID) (*model.Group, error)
	GetGroupsByUid(c context.Context, uid uuid.UUID, cursor uuid.UUID, limit int, getNext bool) ([]*model.Group, *model.Cursor, error)
	UpdateGroup(c context.Context, id uuid.UUID, name string) (*model.Group, error)
}
