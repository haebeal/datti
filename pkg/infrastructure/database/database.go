package database

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/extra/bundebug"
)

type DBClient struct {
	Client *bun.DB
}

func NewBunClient(dsn string) (*DBClient, error) {
	poolConfig, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}

	poolConfig.MaxConns = 10
	poolConfig.MinConns = 2
	poolConfig.MaxConnIdleTime = 30

	pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		return nil, err
	}

	sqldb := stdlib.OpenDBFromPool(pool)
	db := bun.NewDB(sqldb, pgdialect.New())

	// クエリーフックを追加
	db.AddQueryHook(bundebug.NewQueryHook(
		bundebug.WithVerbose(true),
	))

	return &DBClient{Client: db}, nil
}
