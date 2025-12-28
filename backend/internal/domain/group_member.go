package domain

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

// グループメンバー
type GroupMember struct {
	groupID ulid.ULID
	userID  uuid.UUID
}

func NewGroupMember(groupID ulid.ULID, userID uuid.UUID) (*GroupMember, error) {
	if userID == uuid.Nil {
		return nil, fmt.Errorf("userID must not be nil")
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

func (gm *GroupMember) UserID() uuid.UUID {
	return gm.userID
}

type GroupMemberRepository interface {
	AddMember(context.Context, ulid.ULID, uuid.UUID) error
	FindMembersByGroupID(context.Context, ulid.ULID) ([]uuid.UUID, error)
}
