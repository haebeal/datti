package domain

import (
	"fmt"
	"net/mail"
	"net/url"
	"unicode/utf8"

	"github.com/google/uuid"
)

// ユーザー
type User struct {
	id     uuid.UUID
	name   string
	avatar string
	email  string
}

func NewUser(id string, name string, avatar string, email string) (*User, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}

	nl := utf8.RuneCountInString(name)
	if nl <= 0 {
		return nil, fmt.Errorf("name length must be greater than 0")
	}

	parsedURL, err := url.Parse(avatar)
	if err != nil {
		return nil, err
	}
	if parsedURL.Scheme == "" || parsedURL.Host == "" {
		return nil, fmt.Errorf("invalid avatar URL: scheme and host are required")
	}

	_, err = mail.ParseAddress(email)
	if err != nil {
		return nil, err
	}

	return &User{uuid, name, avatar, email}, nil
}

func (u *User) Equal(c *User) bool {
	return u.id.String() == c.id.String()
}

func (u *User) ID() uuid.UUID {
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

type UserRepository interface {
	FindByID(uuid.UUID) (*User, error)
	FindAll() ([]*User, error)
	Update(*User) error
}
