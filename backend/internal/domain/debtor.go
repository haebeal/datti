package domain

import (
	"context"

	"github.com/oklog/ulid/v2"
)

// 債務者
type Debtor struct {
	id     string
	name   string
	avatar string
	email  string
	amount int64
}

func NewDebtor(id string, name string, avatar string, email string, amount int64) (*Debtor, error) {
	return &Debtor{
		id:     id,
		name:   name,
		avatar: avatar,
		email:  email,
		amount: amount,
	}, nil
}

func (d *Debtor) Update(amount int64) (*Debtor, error) {
	return NewDebtor(
		d.id,
		d.name,
		d.avatar,
		d.email,
		amount,
	)
}

func (d *Debtor) Equal(c *Debtor) bool {
	return d.id == c.id
}

func (d *Debtor) ID() string {
	return d.id
}

func (d *Debtor) Name() string {
	return d.name
}

func (d *Debtor) Avatar() string {
	return d.avatar
}

func (d *Debtor) Email() string {
	return d.email
}

func (d *Debtor) Amount() int64 {
	return d.amount
}

type DebtorRepository interface {
	Create(context.Context, *Lending, *Payer, *Debtor) error
	FindByEventID(context.Context, ulid.ULID) ([]*Debtor, error)
	FindByEventIDs(context.Context, []ulid.ULID) (map[ulid.ULID][]*Debtor, error)
	Update(context.Context, *Lending, *Debtor) error
	Delete(context.Context, *Lending, *Debtor) error
}
