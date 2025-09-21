package domain

import "github.com/google/uuid"

// 支払い者
type Payer struct {
	id     uuid.UUID
	name   string
	avatar string
	email  string
	amount *Amount
}

func NewPayer(id uuid.UUID, name string, avatar string, email string, amount *Amount) (*Payer, error) {
	return &Payer{
		id:     id,
		name:   name,
		avatar: avatar,
		email:  email,
		amount: amount,
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

func (p *Payer) Amount() *Amount {
	return p.amount
}

type PayerRepository interface {
	FindByEventID(uuid.UUID) (*[]Payer, error)
}
