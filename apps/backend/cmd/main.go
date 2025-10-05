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
	"github.com/haebeal/datti/internal/presentation/api/middleware"
	"github.com/haebeal/datti/internal/presentation/api/server"
	"github.com/haebeal/datti/internal/usecase"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"

	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
)

func newExporter(ctx context.Context) (*otlptrace.Exporter, error) {
	exp, err := otlptracehttp.New(ctx)

	return exp, err
}

func newTracerProvider(exp sdktrace.SpanExporter) (*sdktrace.TracerProvider, error) {
	r, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
		),
	)

	return sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(r),
	), err
}

func main() {
	ctx := context.Background()

	exp, err := newExporter(ctx)
	if err != nil {
		log.Fatalf("failed to initialize OTLP exporter: %v", err)
	}

	tp, err := newTracerProvider(exp)
	if err != nil {
		log.Fatalf("failed to initialize OTLP tracer: %v", err)
	}

	otel.SetTracerProvider(tp)

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

	lu := usecase.NewLendingUseCase(ur, pr, dr, lr)

	hh := handler.NewHealthzHandler()
	lh := handler.NewLendingHandler(lu)
	server := server.NewServer(lh, hh)

	e := echo.New()

	e.Use(otelecho.Middleware("github.com/haebeal/datti"))
	e.Use(middleware.AuthMiddleware())
	api.RegisterHandlers(e, server)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", port)))
}
