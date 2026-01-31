package domain

import (
	"context"

	"go.opentelemetry.io/otel/codes"
)

// Credit ユーザー間の債権/債務を表すエンティティ
// Amount が正なら貸している、負なら借りている
type Credit struct {
	userID string
	amount int64
}

// NewCredit Creditエンティティのファクトリ関数
func NewCredit(ctx context.Context, userID string, amount int64) (c *Credit, err error) {
	_, span := tracer.Start(ctx, "domain.Credit.NewCredit")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	if userID == "" {
		return nil, NewValidationError("userID", "ユーザーIDは必須です")
	}

	return &Credit{
		userID: userID,
		amount: amount,
	}, nil
}

// UserID 相手ユーザーID
func (c *Credit) UserID() string {
	return c.userID
}

// Amount 金額（正=貸している、負=借りている）
func (c *Credit) Amount() int64 {
	return c.amount
}

// IsLending 貸しているかどうか
func (c *Credit) IsLending() bool {
	return c.amount > 0
}

// IsBorrowing 借りているかどうか
func (c *Credit) IsBorrowing() bool {
	return c.amount < 0
}

// CreateRepayment この借りに対する返済を作成する
// payerIDには返済する人（自分）のIDを渡す
func (c *Credit) CreateRepayment(ctx context.Context, payerID string, amount int64) (r *Repayment, err error) {
	_, span := tracer.Start(ctx, "domain.Credit.CreateRepayment")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// 借りていない場合は返済できない
	if !c.IsBorrowing() {
		return nil, NewValidationError("credit", "借りがないため返済できません")
	}

	// c.userID = 貸してくれている人（返済の受取人）
	return CreateRepayment(ctx, payerID, c.userID, amount)
}

// CreditRepository 債権/債務リポジトリのインターフェース
type CreditRepository interface {
	// FindByUserID 自分と他ユーザーとの債権/債務一覧を取得
	FindByUserID(ctx context.Context, userID string) ([]*Credit, error)
	// FindByUserIDAndOtherUserID 特定のユーザーとの債権/債務を取得
	FindByUserIDAndOtherUserID(ctx context.Context, userID string, otherUserID string) (*Credit, error)
}
