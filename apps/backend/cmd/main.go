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
	pr := repository.NewPaymentEvent(ctx, conn, queries)

	pu := usecase.NewPaymentUseCase(pr, ur)

	ph := handler.NewPaymentHandler(pu)
	hh := handler.NewHealthHandler()
	server := server.NewServer(ph, hh)

	e := echo.New()

	api.RegisterHandlers(e, server)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", port)))
}
