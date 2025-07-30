package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/haebeal/datti/pkg/application"
	"github.com/haebeal/datti/pkg/gateway"
	"github.com/haebeal/datti/pkg/infrastructure/postgres"
	"github.com/haebeal/datti/pkg/presentation/api"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
)

func main() {
	ctx := context.Background()

	dsn, ok := os.LookupEnv("DSN")
	if !ok {
		log.Fatal("環境変数DSNが設定してありません")
	}

	port, ok := os.LookupEnv("PORT")
	if !ok {
		log.Fatal("環境変数PORTが設定してありません")
	}

	conn, err := pgx.Connect(ctx, dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(ctx)

	queries := gateway.New(conn)

	er := postgres.NewEventPostgresRepository(ctx, queries)

	eu := application.NewEventUseCase(er)

	eh := api.NewEventHandler(eu)

	e := echo.New()

	e.POST("/events", eh.HandlePost)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", port)))
}
