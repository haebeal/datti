package domain

import (
	"context"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

// 債務者
type Debtor struct {
	id     uuid.UUID
	name   string
	avatar string
	email  string
	amount *Amount
}

func NewDebtor(id uuid.UUID, name string, avatar string, email string, amount *Amount) (*Debtor, error) {
	return &Debtor{
		id:     id,
		name:   name,
		avatar: avatar,
		email:  email,
		amount: amount,
	}, nil
}

func (d *Debtor) Equal(c *Debtor) bool {
	return d.id.String() == c.id.String()
}

func (d *Debtor) ID() uuid.UUID {
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

func (d *Debtor) Amount() *Amount {
	return d.amount
}

type DebtorRepository interface {
	Create(context.Context, *LendingEvent, *Payer, *Debtor) error
	FindByEventID(context.Context, ulid.ULID) ([]*Debtor, error)
}
