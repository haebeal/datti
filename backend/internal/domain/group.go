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
	createdBy uuid.UUID
	createdAt time.Time
	updatedAt time.Time
}

func NewGroup(id ulid.ULID, name string, createdBy uuid.UUID, createdAt time.Time, updatedAt time.Time) (*Group, error) {
	if utf8.RuneCountInString(name) < 1 {
		return nil, fmt.Errorf("グループ名は1文字以上である必要があります: %v", name)
	}
	if createdBy == uuid.Nil {
		return nil, fmt.Errorf("createdBy must not be nil")
	}
	if createdAt.After(updatedAt) {
		return nil, fmt.Errorf("作成日は更新日より前である必要があります")
	}

	return &Group{
		id:        id,
		name:      name,
		createdBy: createdBy,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

func CreateGroup(name string, createdBy uuid.UUID) (*Group, error) {
	id := ulid.Make()
	now := time.Now()

	return NewGroup(id, name, createdBy, now, now)
}

func (g *Group) Update(name string) (*Group, error) {
	return NewGroup(g.id, name, g.createdBy, g.createdAt, time.Now())
}

func (g *Group) ID() ulid.ULID {
	return g.id
}

func (g *Group) Name() string {
	return g.name
}

func (g *Group) CreatedBy() uuid.UUID {
	return g.createdBy
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
	FindByID(context.Context, ulid.ULID) (*Group, error)
	Update(context.Context, *Group) error
}
