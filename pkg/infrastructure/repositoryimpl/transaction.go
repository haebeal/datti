package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/repository"
	"gorm.io/gorm"
)

var txKey = struct{}{}

type tx struct {
	db *gorm.DB
}

func NewTransaction(db *gorm.DB) repository.Transaction {
	return &tx{db: db}
}

func (t *tx) DoInTx(ctx context.Context, f func(ctx context.Context) (interface{}, error)) (interface{}, error) {
	tx := t.db.WithContext(ctx).Begin()

	// ここでctxへトランザクションオブジェクトを放り込む。
	ctx = context.WithValue(ctx, &txKey, tx)

	// トランザクションの対象処理へコンテキストを引き継ぎ
	v, err := f(ctx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		// エラーならロールバック
		tx.Rollback()
		return nil, err
	}
	return v, nil
}

// context.Contextからトランザクションを取得する関数も忘れずに！
func GetTx(ctx context.Context) (*gorm.Tx, bool) {
	tx, ok := ctx.Value(&txKey).(*gorm.Tx)
	return tx, ok
}
