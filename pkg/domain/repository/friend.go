package repository

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
)

type FriendRepository interface {
	GetFriends(c context.Context, uid string) ([]*model.Friend, error)
	GetApplyings(c context.Context, uid string) ([]*model.Friend, error)
	GetApplieds(c context.Context, uid string) ([]*model.Friend, error)
	SetFriends(c context.Context, uid string, fuid string) error
	DeleteFriend(c context.Context, uid string, fuid string) error
}
