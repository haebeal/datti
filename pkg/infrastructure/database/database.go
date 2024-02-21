package database

import (
	"context"

	"entgo.io/ent/dialect"
	"github.com/datti-api/ent"
	_ "github.com/lib/pq"
)

type DBClient struct {
	Client *ent.Client
}

func NewDBClient(dsn string) (*DBClient, error) {
	db, err := ent.Open(
		dialect.Postgres,
		dsn,
	)
	if err != nil {
		return nil, err
	}

	// マイグレーションの実行
	if err := db.Schema.Create(context.Background()); err != nil {
		db.Close()
		return nil, err
	}

	return &DBClient{Client: db}, nil
}
