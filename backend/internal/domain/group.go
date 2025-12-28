package domain

import (
	"context"
	"fmt"
	"time"
	"unicode/utf8"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

// グループ
type Group struct {
	id        ulid.ULID
	name      string
	ownerID   uuid.UUID
	createdAt time.Time
	updatedAt time.Time
}

func NewGroup(id ulid.ULID, name string, ownerID uuid.UUID, createdAt time.Time, updatedAt time.Time) (*Group, error) {
	if utf8.RuneCountInString(name) < 1 {
		return nil, fmt.Errorf("グループ名は1文字以上である必要があります: %v", name)
	}
	if ownerID == uuid.Nil {
		return nil, fmt.Errorf("ownerID must not be nil")
	}
	if createdAt.After(updatedAt) {
		return nil, fmt.Errorf("作成日は更新日より前である必要があります")
	}

	return &Group{
		id:        id,
		name:      name,
		ownerID:   ownerID,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

func CreateGroup(name string, ownerID uuid.UUID) (*Group, error) {
	id := ulid.Make()
	now := time.Now()

	return NewGroup(id, name, ownerID, now, now)
}

func (g *Group) ID() ulid.ULID {
	return g.id
}

func (g *Group) Name() string {
	return g.name
}

func (g *Group) OwnerID() uuid.UUID {
	return g.ownerID
}

func (g *Group) CreatedAt() time.Time {
	return g.createdAt
}

func (g *Group) UpdatedAt() time.Time {
	return g.updatedAt
}

type GroupRepository interface {
	Create(context.Context, *Group) error
	FindByMemberUserID(context.Context, uuid.UUID) ([]*Group, error)
}
