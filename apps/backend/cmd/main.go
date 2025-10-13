package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/haebeal/datti/internal/gateway/repository"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/haebeal/datti/internal/presentation/api/middleware"
	"github.com/haebeal/datti/internal/presentation/api/server"
	"github.com/haebeal/datti/internal/usecase"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"

	"go.opentelemetry.io/contrib/exporters/autoexport"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
)

func setupOpenTelemetry(ctx context.Context) (shutdown func(context.Context) error, err error) {
	var shutdownFuncs []func(context.Context) error

	shutdown = func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	texporter, err := autoexport.NewSpanExporter(ctx)
	if err != nil {
		err = errors.Join(err, shutdown(ctx))
		return
	}
	r, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
		),
	)
	if err != nil {
		err = errors.Join(err, shutdown(ctx))
		return
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(texporter),
		sdktrace.WithResource(r),
	)

	otel.SetTracerProvider(tp)
	shutdownFuncs = append(shutdownFuncs, tp.Shutdown)

	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{}, propagation.Baggage{}),
	)

	return shutdown, nil
}

func main() {
	ctx := context.Background()

	port, ok := os.LookupEnv("PORT")
	if !ok {
		log.Fatal("環境変数PORTが設定してありません")
		os.Exit(1)
	}

	dsn, ok := os.LookupEnv("DSN")
	if !ok {
		log.Fatal("環境変数DSNが設定してありません")
		os.Exit(1)
	}

	shutdown, err := setupOpenTelemetry(ctx)
	if err != nil {
		log.Fatal("OpenTelemetryのセットアップでエラーが発生しました")
		os.Exit(1)
	}

	conn, err := pgx.Connect(ctx, dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(ctx)

	queries := postgres.New(conn)

	ur := repository.NewUserRepository(queries)
	pr := repository.NewPayerRepository(queries)
	dr := repository.NewDebtorRepository(queries)
	lr := repository.NewLendingEventRepository(queries)

	lu := usecase.NewLendingUseCase(ur, pr, dr, lr)

	hh := handler.NewHealthHandler()
	lh := handler.NewLendingHandler(lu)
	server := server.NewServer(lh, hh)

	e := echo.New()

	e.Use(otelecho.Middleware("github.com/haebeal/datti"))
	e.Use(middleware.AuthMiddleware())
	api.RegisterHandlers(e, server)

	if err = errors.Join(e.Start(fmt.Sprintf(":%s", port)), shutdown(ctx)); err != nil {
		e.Logger.Fatal(err)
		os.Exit(1)
	}
}
