package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/google/uuid"
)

type GroupUserReopsitory interface {
	CreateGroupUser(c context.Context, uid uuid.UUID, id uuid.UUID) error
	GetGroupUserByUid(c context.Context, uid uuid.UUID) ([]*model.GroupUser, error)
	GetGroupUserById(c context.Context, id uuid.UUID) ([]*model.GroupUser, error)
	GetGroupUser(c context.Context, groupID uuid.UUID, userID uuid.UUID) (*model.GroupUser, error)
	UpdateGroupUser(c context.Context, uid uuid.UUID, id uuid.UUID) error
	DeleteGroupUser(c context.Context, uid uuid.UUID, id uuid.UUID) error
}
