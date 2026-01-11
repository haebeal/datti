package domain

import (
	"context"
	"fmt"
	"time"

	"github.com/oklog/ulid/v2"
)

// 返済イベント
type Repayment struct {
	id        ulid.ULID
	payerID   string
	debtorID  string
	amount    *Amount
	createdAt time.Time
	updatedAt time.Time
}

func NewRepayment(id ulid.ULID, payerID string, debtorID string, amount *Amount, createdAt time.Time, updatedAt time.Time) (*Repayment, error) {
	if payerID == "" {
		return nil, fmt.Errorf("payerIDは必須です")
	}

	if debtorID == "" {
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

func CreateRepayment(payerID string, debtorID string, amount *Amount) (*Repayment, error) {
	id := ulid.Make()
	now := time.Now()

	return NewRepayment(id, payerID, debtorID, amount, now, now)
}

func (r *Repayment) ID() ulid.ULID {
	return r.id
}

func (r *Repayment) PayerID() string {
	return r.payerID
}

func (r *Repayment) DebtorID() string {
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

func (r *Repayment) UpdateAmount(amount *Amount) error {
	if amount == nil {
		return fmt.Errorf("amountは必須です")
	}

	if amount.Value() <= 0 {
		return fmt.Errorf("amountは正の値である必要があります")
	}

	r.amount = amount
	r.updatedAt = time.Now()
	return nil
}

// RepaymentPaginationParams holds cursor-based pagination parameters
type RepaymentPaginationParams struct {
	Limit  int32
	Cursor *string
}

// PaginatedRepayments holds paginated results
type PaginatedRepayments struct {
	Repayments []*Repayment
	NextCursor *string
	HasMore    bool
}

type RepaymentRepository interface {
	Create(context.Context, *Repayment) error
	FindByID(context.Context, ulid.ULID) (*Repayment, error)
	FindByPayerIDWithPagination(context.Context, string, RepaymentPaginationParams) (*PaginatedRepayments, error)
	Update(context.Context, *Repayment) error
	Delete(context.Context, ulid.ULID) error
}
