package repository

import (
	"context"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"go.opentelemetry.io/otel/codes"
)

// CreditRepositoryImpl 債権/債務リポジトリの実装
type CreditRepositoryImpl struct {
	queries *postgres.Queries
}

// NewCreditRepository CreditRepositoryImplのファクトリ関数
func NewCreditRepository(queries *postgres.Queries) *CreditRepositoryImpl {
	return &CreditRepositoryImpl{
		queries: queries,
	}
}

// FindByUserID 自分と他ユーザーとの債権/債務一覧を取得
// 正=貸している、負=借りている
func (r *CreditRepositoryImpl) FindByUserID(ctx context.Context, userID string) (credits []*domain.Credit, err error) {
	ctx, span := tracer.Start(ctx, "repository.Credit.FindByUserID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// 貸している金額を取得
	lendings, err := r.queries.ListLendingCreditAmountsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 借りている金額を取得
	borrowings, err := r.queries.ListBorrowingCreditAmountsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// ユーザーごとの残高を計算
	balances := make(map[string]int64)
	for _, l := range lendings {
		balances[l.UserID] += l.Amount // 貸し = 正
	}
	for _, b := range borrowings {
		balances[b.UserID] -= b.Amount // 借り = 負
	}

	// 0以外のCreditを作成
	credits = make([]*domain.Credit, 0, len(balances))
	for otherUserID, amount := range balances {
		if amount == 0 {
			continue
		}
		credit, err := domain.NewCredit(ctx, otherUserID, amount)
		if err != nil {
			return nil, err
		}
		credits = append(credits, credit)
	}

	return credits, nil
}

// FindByUserIDAndOtherUserID 特定のユーザーとの債権/債務を取得
// 正=貸している、負=借りている
func (r *CreditRepositoryImpl) FindByUserIDAndOtherUserID(ctx context.Context, userID string, otherUserID string) (credit *domain.Credit, err error) {
	ctx, span := tracer.Start(ctx, "repository.Credit.FindByUserIDAndOtherUserID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// 貸している金額を取得
	lendings, err := r.queries.ListLendingCreditAmountsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 借りている金額を取得
	borrowings, err := r.queries.ListBorrowingCreditAmountsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 対象ユーザーとの残高を計算
	var amount int64
	for _, l := range lendings {
		if l.UserID == otherUserID {
			amount += l.Amount // 貸し = 正
		}
	}
	for _, b := range borrowings {
		if b.UserID == otherUserID {
			amount -= b.Amount // 借り = 負
		}
	}

	if amount == 0 {
		return nil, domain.NewNotFoundError("credit", otherUserID)
	}

	return domain.NewCredit(ctx, otherUserID, amount)
}
