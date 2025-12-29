package domain

import (
	"context"
	"fmt"
	"net/mail"
	"net/url"
	"unicode/utf8"
)

// ユーザー
type User struct {
	id     string
	name   string
	avatar string
	email  string
}

func NewUser(id string, name string, avatar string, email string) (*User, error) {
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}

	nl := utf8.RuneCountInString(name)
	if nl <= 0 {
		return nil, fmt.Errorf("name length must be greater than 0")
	}

	parsedURL, err := url.Parse(avatar)
	if err != nil {
		return nil, fmt.Errorf("invalid avatar URL: parse error")
	}
	if parsedURL.Scheme == "" || parsedURL.Host == "" {
		return nil, fmt.Errorf("invalid avatar URL: scheme and host are required")
	}

	_, err = mail.ParseAddress(email)
	if err != nil {
		return nil, fmt.Errorf("invalid email format")
	}

	return &User{id, name, avatar, email}, nil
}

func (u *User) ID() string {
	return u.id
}

func (u *User) Name() string {
	return u.name
}

func (u *User) Avatar() string {
	return u.avatar
}

func (u *User) Email() string {
	return u.email
}

// WithUpdatedProfile はプロフィール情報（name, avatar）を更新した新しいUserを返す。
// id, emailは不変のため変更されない。
func (u *User) WithUpdatedProfile(name string, avatar string) (*User, error) {
	nl := utf8.RuneCountInString(name)
	if nl <= 0 {
		return nil, fmt.Errorf("name length must be greater than 0")
	}

	parsedURL, err := url.Parse(avatar)
	if err != nil {
		return nil, fmt.Errorf("invalid avatar URL: parse error")
	}
	if parsedURL.Scheme == "" || parsedURL.Host == "" {
		return nil, fmt.Errorf("invalid avatar URL: scheme and host are required")
	}

	return &User{
		id:     u.id,
		name:   name,
		avatar: avatar,
		email:  u.email,
	}, nil
}

type UserRepository interface {
	FindByID(context.Context, string) (*User, error)
	FindBySearch(context.Context, *string, *string, int32) ([]*User, error)
	Create(context.Context, *User) error
	Update(context.Context, *User) error
}
