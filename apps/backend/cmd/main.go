package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/haebeal/datti/internal/gateway/repository"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/haebeal/datti/internal/presentation/api/server"
	"github.com/haebeal/datti/internal/usecase"
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

	queries := postgres.New(conn)

	ur := repository.NewUserRepository(ctx, queries)
	pr := repository.NewPayerRepository(ctx, queries)
	dr := repository.NewDebtorRepository(ctx, queries)
	lr := repository.NewLendingEventRepository(ctx, queries)

	lu := usecase.NewLendingEventUseCase(ur, pr, dr, lr)

	hh := handler.NewHealthHandler()
	lh := handler.NewLendingEventHandler(lu)
	server := server.NewServer(lh, hh)

	e := echo.New()

	api.RegisterHandlers(e, server)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", port)))
}
