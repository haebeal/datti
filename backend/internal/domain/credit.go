package domain

import (
	"context"

	"go.opentelemetry.io/otel/codes"
)

// Credit ユーザー間の債権/債務を表すエンティティ
// 貸しているか借りているかはユースケース層で判断する
type Credit struct {
	userID string
	amount int64
}

// NewCredit Creditエンティティのファクトリ関数
func NewCredit(userID string, amount int64) (*Credit, error) {
	if userID == "" {
		return nil, NewValidationError("userID", "ユーザーIDは必須です")
	}
	if amount == 0 {
		return nil, NewValidationError("amount", "金額は0以外である必要があります")
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

// Amount 金額
func (c *Credit) Amount() int64 {
	return c.amount
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

	// c.userID = 貸してくれている人（返済の受取人）
	return CreateRepayment(ctx, payerID, c.userID, amount)
}

// CreditRepository 債権/債務リポジトリのインターフェース
type CreditRepository interface {
	// ListLendingsByUserID 自分が貸している一覧を取得（相手が自分に借りている）
	ListLendingsByUserID(ctx context.Context, userID string) ([]*Credit, error)
	// ListBorrowingsByUserID 自分が借りている一覧を取得（自分が相手に借りている）
	ListBorrowingsByUserID(ctx context.Context, userID string) ([]*Credit, error)
}
