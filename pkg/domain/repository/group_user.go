package repository

import (
	"context"
)

type GroupUserReopsitory interface {
	CreateGroupUser(c context.Context, uid string, id string) error
	UpdateGroupUser(c context.Context, uid string, id string) error
	DeleteGroupUser(c context.Context, uid string, id string) error
}
