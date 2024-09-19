package repositoryimpl

import (
	"context"
	"database/sql"

	"github.com/datti-api/pkg/domain/repository"
	"github.com/uptrace/bun"
)

var txKey = struct{}{}

type tx struct {
	db *bun.DB
}

func NewTransaction(db *bun.DB) repository.Transaction {
	return &tx{db: db}
}

func (t *tx) DoInTx(ctx context.Context, f func(ctx context.Context) (interface{}, error)) (interface{}, error) {
	tx, err := t.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, err
	}

	// ここでctxへトランザクションオブジェクトを格納する
	ctx = context.WithValue(ctx, &txKey, tx)

	// トランザクションの対象処理へコンテキストを引き継ぎ
	v, err := f(ctx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		// エラーならロールバック
		tx.Rollback()
		return nil, err
	}
	return v, nil
}

// context.Contextからトランザクションを取得する関数も忘れずに！
func GetTx(ctx context.Context) (*bun.Tx, bool) {
	tx, ok := ctx.Value(&txKey).(*bun.Tx)
	return tx, ok
}
