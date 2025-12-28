package domain

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

// 返済イベント
type Repayment struct {
	id        ulid.ULID
	payerID   uuid.UUID
	debtorID  uuid.UUID
	amount    *Amount
	createdAt time.Time
	updatedAt time.Time
}

func NewRepayment(id ulid.ULID, payerID uuid.UUID, debtorID uuid.UUID, amount *Amount, createdAt time.Time, updatedAt time.Time) (*Repayment, error) {
	if payerID == uuid.Nil {
		return nil, fmt.Errorf("payerIDは必須です")
	}

	if debtorID == uuid.Nil {
		return nil, fmt.Errorf("debtorIDは必須です")
	}

	if payerID == debtorID {
		return nil, fmt.Errorf("payerIDとdebtorIDは異なる必要があります")
	}

	if amount == nil {
		return nil, fmt.Errorf("amountは必須です")
	}

	if amount.Value() <= 0 {
		return nil, fmt.Errorf("amountは正の値である必要があります")
	}

	if createdAt.After(updatedAt) {
		return nil, fmt.Errorf("作成日は更新日より前である必要があります")
	}

	return &Repayment{
		id:        id,
		payerID:   payerID,
		debtorID:  debtorID,
		amount:    amount,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

func CreateRepayment(payerID uuid.UUID, debtorID uuid.UUID, amount *Amount) (*Repayment, error) {
	id := ulid.Make()
	now := time.Now()

	return NewRepayment(id, payerID, debtorID, amount, now, now)
}

func (r *Repayment) ID() ulid.ULID {
	return r.id
}

func (r *Repayment) PayerID() uuid.UUID {
	return r.payerID
}

func (r *Repayment) DebtorID() uuid.UUID {
	return r.debtorID
}

func (r *Repayment) Amount() *Amount {
	return r.amount
}

func (r *Repayment) CreatedAt() time.Time {
	return r.createdAt
}

func (r *Repayment) UpdatedAt() time.Time {
	return r.updatedAt
}

type RepaymentRepository interface {
	Create(context.Context, *Repayment) error
	FindByPayerID(context.Context, uuid.UUID) ([]*Repayment, error)
}
