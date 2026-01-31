package domain

import (
	"context"
	"time"
	"unicode/utf8"

	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

// Group グループを表すドメインエンティティ
type Group struct {
	id        ulid.ULID
	name      string
	createdBy string
	createdAt time.Time
	updatedAt time.Time
}

// NewGroup グループドメインエンティティのファクトリ関数
func NewGroup(ctx context.Context, id ulid.ULID, name string, createdBy string, createdAt time.Time, updatedAt time.Time) (g *Group, err error) {
	_, span := tracer.Start(ctx, "domain.Group.New")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	if utf8.RuneCountInString(name) < 1 {
		return nil, NewValidationError("name", "グループ名は1文字以上である必要があります")
	}

	if createdBy == "" {
		return nil, NewValidationError("createdBy", "作成者IDは必須です")
	}

	if createdAt.After(updatedAt) {
		return nil, NewValidationError("createdAt", "作成日は更新日より前である必要があります")
	}

	return &Group{
		id:        id,
		name:      name,
		createdBy: createdBy,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

// CreateGroup グループの作成を行うファクトリ関数
func CreateGroup(ctx context.Context, name string, createdBy string) (g *Group, err error) {
	ctx, span := tracer.Start(ctx, "domain.Group.Create")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	id := ulid.Make()
	now := time.Now()

	return NewGroup(ctx, id, name, createdBy, now, now)
}

// Update グループの更新を行う
func (g *Group) Update(ctx context.Context, name string) (*Group, error) {
	ctx, span := tracer.Start(ctx, "domain.Group.Update")
	defer span.End()

	now := time.Now()

	return NewGroup(ctx, g.id, name, g.createdBy, g.createdAt, now)
}

// ID グループID (ULID形式)
func (g *Group) ID() ulid.ULID {
	return g.id
}

// Name グループ名
func (g *Group) Name() string {
	return g.name
}

func (g *Group) CreatedBy() string {
	return g.createdBy
}

// CreatedAt 作成日時
func (g *Group) CreatedAt() time.Time {
	return g.createdAt
}

// UpdatedAt 更新日時
func (g *Group) UpdatedAt() time.Time {
	return g.updatedAt
}

type GroupRepository interface {
	Create(ctx context.Context, g *Group) error
	FindByMemberUserID(ctx context.Context, userID string) ([]*Group, error)
	FindByID(ctx context.Context, id ulid.ULID) (*Group, error)
	Update(ctx context.Context, g *Group) error
	Delete(ctx context.Context, g *Group) error

	AddMember(ctx context.Context, g *Group, u *User) error
	FindMembersByID(ctx context.Context, id ulid.ULID) ([]*User, error)
	RemoveMember(ctx context.Context, g *Group, u *User) error
}
