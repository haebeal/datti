package main

import (
	"context"
	"fmt"
	"log"

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

	// dsn, ok := os.LookupEnv("DSN")
	// if !ok {
	// 	log.Fatal("環境変数DSNが設定してありません")
	// }

	// port, ok := os.LookupEnv("PORT")
	// if !ok {
	// 	log.Fatal("環境変数PORTが設定してありません")
	// }

	dsn := "postgres://postgres:password@postgres:5432/datti?sslmode=disable"
	port := "7070"

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
	server := server.NewServer(ph)

	e := echo.New()

	api.RegisterHandlers(e, server)
	// e.POST("/events", ph.Create)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", port)))
}
