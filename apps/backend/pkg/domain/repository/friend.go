package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/pkg/domain/model"
)

type FriendRepository interface {
	GetFriends(c context.Context, uid uuid.UUID) ([]*model.Friend, error)
	GetApplyings(c context.Context, uid uuid.UUID) ([]*model.Friend, error)
	GetApplieds(c context.Context, uid uuid.UUID) ([]*model.Friend, error)
	SetFriends(c context.Context, uid uuid.UUID, fuid uuid.UUID) error
	GetStatus(c context.Context, uid uuid.UUID, fuid uuid.UUID) (string, error)
	DeleteFriend(c context.Context, uid uuid.UUID, fuid uuid.UUID) error
}
