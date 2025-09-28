package domain

import (
	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

// 支払い者
type Payer struct {
	id     uuid.UUID
	name   string
	avatar string
	email  string
}

func NewPayer(id uuid.UUID, name string, avatar string, email string) (*Payer, error) {
	return &Payer{
		id:     id,
		name:   name,
		avatar: avatar,
		email:  email,
	}, nil
}

func (p *Payer) Equal(c *Payer) bool {
	return p.id.String() == c.id.String()
}

func (p *Payer) ID() uuid.UUID {
	return p.id
}

func (p *Payer) Name() string {
	return p.name
}

func (p *Payer) Avatar() string {
	return p.avatar
}

func (p *Payer) Email() string {
	return p.email
}

type PayerRepository interface {
	FindByEventID(userID uuid.UUID, eventID ulid.ULID) (*Payer, error)
}
