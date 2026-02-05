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
	id          ulid.ULID
	name        string
	description string
	createdBy   string
	createdAt   time.Time
	updatedAt   time.Time
}

// NewGroup グループドメインエンティティのファクトリ関数
func NewGroup(ctx context.Context, id ulid.ULID, name string, description string, createdBy string, createdAt time.Time, updatedAt time.Time) (g *Group, err error) {
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

	if utf8.RuneCountInString(description) > 500 {
		return nil, NewValidationError("description", "説明文は500文字以内で入力してください")
	}

	if createdBy == "" {
		return nil, NewValidationError("createdBy", "作成者IDは必須です")
	}

	if createdAt.After(updatedAt) {
		return nil, NewValidationError("createdAt", "作成日は更新日より前である必要があります")
	}

	return &Group{
		id:          id,
		name:        name,
		description: description,
		createdBy:   createdBy,
		createdAt:   createdAt,
		updatedAt:   updatedAt,
	}, nil
}

// CreateGroup グループの作成を行うファクトリ関数
func CreateGroup(ctx context.Context, name string, description string, createdBy string) (g *Group, err error) {
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

	return NewGroup(ctx, id, name, description, createdBy, now, now)
}

// Update グループの更新を行う
func (g *Group) Update(ctx context.Context, name string, description string) (*Group, error) {
	ctx, span := tracer.Start(ctx, "domain.Group.Update")
	defer span.End()

	now := time.Now()

	return NewGroup(ctx, g.id, name, description, g.createdBy, g.createdAt, now)
}

// ID グループID (ULID形式)
func (g *Group) ID() ulid.ULID {
	return g.id
}

// Name グループ名
func (g *Group) Name() string {
	return g.name
}

// Description 説明文
func (g *Group) Description() string {
	return g.description
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

// GroupRepository グループリポジトリのインターフェース
type GroupRepository interface {
	// Create グループを作成する
	Create(ctx context.Context, g *Group) error
	// FindByMemberUserID ユーザーが所属するグループ一覧を取得する
	FindByMemberUserID(ctx context.Context, userID string) ([]*Group, error)
	// FindByID IDでグループを取得する
	FindByID(ctx context.Context, id ulid.ULID) (*Group, error)
	// Update グループを更新する
	Update(ctx context.Context, g *Group) error
	// Delete グループを削除する
	Delete(ctx context.Context, g *Group) error
	// AddMember グループにメンバーを追加する
	AddMember(ctx context.Context, g *Group, u *User) error
	// FindMembersByID グループのメンバー一覧を取得する
	FindMembersByID(ctx context.Context, id ulid.ULID) ([]*User, error)
	// RemoveMember グループからメンバーを削除する
	RemoveMember(ctx context.Context, g *Group, u *User) error
}
