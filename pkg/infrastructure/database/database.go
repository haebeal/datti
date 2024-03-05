package database

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/stdlib"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/extra/bundebug"
)

type DBClient struct {
	Client *bun.DB
}

func NewBunClient(dsn string) (*DBClient, error) {
	config, err := pgx.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}
	config.PreferSimpleProtocol = true

	sqlDB := stdlib.OpenDB(*config)
	db := bun.NewDB(sqlDB, pgdialect.New())

	// クエリーフックを追加
	db.AddQueryHook(bundebug.NewQueryHook(
		bundebug.WithVerbose(true),
	))

	// テーブルを削除・作成
	if err := db.ResetModel(context.TODO(), (*model.BankAccount)(nil), (*model.Friend)(nil)); err != nil {
		return nil, err
	}

	return &DBClient{Client: db}, nil
}
