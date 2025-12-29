package domain

import (
	"context"
	"errors"
	"fmt"

	"github.com/oklog/ulid/v2"
)

var ErrGroupMemberAlreadyExists = errors.New("group member already exists")

// グループメンバー
type GroupMember struct {
	groupID ulid.ULID
	userID  string
}

func NewGroupMember(groupID ulid.ULID, userID string) (*GroupMember, error) {
	if userID == "" {
		return nil, fmt.Errorf("userID must not be empty")
	}
	if groupID == (ulid.ULID{}) {
		return nil, fmt.Errorf("groupID must not be nil")
	}

	return &GroupMember{
		groupID: groupID,
		userID:  userID,
	}, nil
}

func (gm *GroupMember) GroupID() ulid.ULID {
	return gm.groupID
}

func (gm *GroupMember) UserID() string {
	return gm.userID
}

type GroupMemberRepository interface {
	AddMember(context.Context, ulid.ULID, string) error
	FindMembersByGroupID(context.Context, ulid.ULID) ([]string, error)
	FindMemberUsersByGroupID(context.Context, ulid.ULID) ([]*User, error)
}
