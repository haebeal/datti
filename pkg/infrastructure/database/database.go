package database

import (
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/stdlib"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
)

type DBClient struct {
	Client *bun.DB
}

func NewBunClient(dsn string) (*DBClient, error) {
	config, err := pgx.ParseConfig(dsn)
	if err != nil {
		panic(err)
	}
	config.PreferSimpleProtocol = true

	sqlDB := stdlib.OpenDB(*config)
	db := bun.NewDB(sqlDB, pgdialect.New())

	return &DBClient{Client: db}, nil
}
