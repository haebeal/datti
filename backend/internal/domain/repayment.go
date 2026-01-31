package domain

import (
	"context"
	"time"

	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

// Repayment 返済イベントエンティティ
type Repayment struct {
	id        ulid.ULID
	payerID   string
	debtorID  string
	amount    int64
	createdAt time.Time
	updatedAt time.Time
}

// NewRepayment Repaymentエンティティのファクトリ関数 (リポジトリからの復元用)
func NewRepayment(ctx context.Context, id ulid.ULID, payerID string, debtorID string, amount int64, createdAt time.Time, updatedAt time.Time) (r *Repayment, err error) {
	_, span := tracer.Start(ctx, "domain.Repayment.New")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	if payerID == "" {
		return nil, NewValidationError("payerID", "支払い者IDは必須です")
	}

	if debtorID == "" {
		return nil, NewValidationError("debtorID", "受取人IDは必須です")
	}

	if payerID == debtorID {
		return nil, NewValidationError("debtorID", "支払い者と受取人は異なる必要があります")
	}

	if amount <= 0 {
		return nil, NewValidationError("amount", "金額は正の値である必要があります")
	}

	if createdAt.After(updatedAt) {
		return nil, NewValidationError("updatedAt", "更新日は作成日より後である必要があります")
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

// CreateRepayment 新規Repaymentを作成するファクトリ関数
func CreateRepayment(ctx context.Context, payerID string, debtorID string, amount int64) (*Repayment, error) {
	id := ulid.Make()
	now := time.Now()

	return NewRepayment(ctx, id, payerID, debtorID, amount, now, now)
}

// Update 返済金額を更新する
func (r *Repayment) Update(ctx context.Context, amount int64) (*Repayment, error) {
	now := time.Now()

	return NewRepayment(ctx, r.id, r.payerID, r.debtorID, amount, r.createdAt, now)
}

// ID 返済ID
func (r *Repayment) ID() ulid.ULID {
	return r.id
}

// PayerID 支払い者ID
func (r *Repayment) PayerID() string {
	return r.payerID
}

// DebtorID 受取人ID
func (r *Repayment) DebtorID() string {
	return r.debtorID
}

// Amount 金額
func (r *Repayment) Amount() int64 {
	return r.amount
}

// CreatedAt 作成日時
func (r *Repayment) CreatedAt() time.Time {
	return r.createdAt
}

// UpdatedAt 更新日時
func (r *Repayment) UpdatedAt() time.Time {
	return r.updatedAt
}

// RepaymentRepository 返済リポジトリのインターフェース
type RepaymentRepository interface {
	Create(ctx context.Context, r *Repayment) error
	FindByID(ctx context.Context, id ulid.ULID) (*Repayment, error)
	FindByPayerID(ctx context.Context, payerID string, cursor *string, limit *int32) ([]*Repayment, error)
	Update(ctx context.Context, r *Repayment) error
	Delete(ctx context.Context, id ulid.ULID) error
}
