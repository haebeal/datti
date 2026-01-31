package domain

import (
	"context"
	"net/mail"
	"net/url"
	"unicode/utf8"

	"go.opentelemetry.io/otel/codes"
)

// User ユーザーを表すドメインエンティティ
type User struct {
	id     string
	name   string
	avatar string
	email  string
}

// NewUser ユーザードメインエンティティのファクトリ関数
func NewUser(ctx context.Context, id string, name string, avatar string, email string) (u *User, err error) {
	_, span := tracer.Start(ctx, "domain.User.New")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	if id == "" {
		return nil, NewValidationError("id", "ユーザーIDは必須です")
	}

	if utf8.RuneCountInString(name) < 1 {
		return nil, NewValidationError("name", "ユーザー名は1文字以上である必要があります")
	}

	parsedURL, err := url.Parse(avatar)
	if err != nil {
		return nil, NewValidationError("avatar", "アバターURLの形式が不正です")
	}
	if parsedURL.Scheme == "" || parsedURL.Host == "" {
		return nil, NewValidationError("avatar", "アバターURLにはスキームとホストが必要です")
	}

	if _, err := mail.ParseAddress(email); err != nil {
		return nil, NewValidationError("email", "メールアドレスの形式が不正です")
	}

	return &User{
		id:     id,
		name:   name,
		avatar: avatar,
		email:  email,
	}, nil
}

// UpdateProfile プロフィールの更新を行う
func (u *User) UpdateProfile(ctx context.Context, name string, avatar string) (*User, error) {
	ctx, span := tracer.Start(ctx, "domain.User.UpdateProfile")
	defer span.End()

	return NewUser(ctx, u.id, name, avatar, u.email)
}

// ID ユーザーID
func (u *User) ID() string {
	return u.id
}

// Name ユーザー名
func (u *User) Name() string {
	return u.name
}

// Avatar アバター画像のURL
func (u *User) Avatar() string {
	return u.avatar
}

// Email メールアドレス
func (u *User) Email() string {
	return u.email
}

type UserRepository interface {
	Create(ctx context.Context, u *User) error
	FindByID(ctx context.Context, id string) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	FindByQuery(ctx context.Context, q *string, cursor *string, limit int32) ([]*User, error)
	Update(ctx context.Context, u *User) error
	UpdateID(ctx context.Context, oldID, newID string) error
}
