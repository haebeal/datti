package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/haebeal/datti/internal/gateway/line"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/haebeal/datti/internal/gateway/repository"
	"github.com/haebeal/datti/internal/gateway/storage"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/haebeal/datti/internal/presentation/api/middleware"
	"github.com/haebeal/datti/internal/presentation/api/server"
	"github.com/haebeal/datti/internal/usecase"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	echomw "github.com/labstack/echo/v4/middleware"

	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.39.0"
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

	texporter, err := otlptracehttp.New(ctx)
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

	dsn, ok := os.LookupEnv("POSTGRES_DSN")
	if !ok {
		log.Fatal("環境変数POSTGRES_DSNが設定してありません")
		os.Exit(1)
	}

	shutdown, err := setupOpenTelemetry(ctx)
	if err != nil {
		log.Fatalf("OpenTelemetryのセットアップでエラーが発生しました: %v", err)
	}

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	queries := postgres.New(pool)

	awsCfg, err := config.LoadDefaultConfig(ctx, config.WithRegion("ap-northeast-1"))
	if err != nil {
		log.Fatal("AWSへの認証に失敗しました")
	}
	cognitoClient := cognitoidentityprovider.NewFromConfig(awsCfg)

	avatarBucket, ok := os.LookupEnv("S3_AVATAR_BUCKET")
	if !ok {
		log.Fatal("環境変数S3_AVATAR_BUCKETが設定してありません")
	}
	avatarBaseURL, ok := os.LookupEnv("AVATAR_BASE_URL")
	if !ok {
		log.Fatal("環境変数AVATAR_BASE_URLが設定してありません")
	}
	// S3 クライアント (R2 or LocalStack 向け)
	// - R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY が設定されていれば R2 用の credentials で上書き
	//   (Cognito GetUser に使う AWS_* とは別物のため)
	// - 未設定なら awsCfg の credentials を流用 (ローカル LocalStack は dummy で動く)
	// - AWS_ENDPOINT_URL_S3 が設定されていれば path-style に
	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if r2Key, ok := os.LookupEnv("R2_ACCESS_KEY_ID"); ok && r2Key != "" {
			r2Secret := os.Getenv("R2_SECRET_ACCESS_KEY")
			o.Credentials = credentials.NewStaticCredentialsProvider(r2Key, r2Secret, "")
			o.Region = "auto"
		}
		if _, ok := os.LookupEnv("AWS_ENDPOINT_URL_S3"); ok {
			o.UsePathStyle = true
		}
	})
	avatarStorage := storage.NewAvatarStorage(s3Client, avatarBucket, avatarBaseURL)

	lineChannelID, _ := os.LookupEnv("LINE_CHANNEL_ID")
	lineChannelSecret, _ := os.LookupEnv("LINE_CHANNEL_SECRET")
	lc := line.NewClient(lineChannelID, lineChannelSecret)

	ur := repository.NewUserRepository(queries)
	lr := repository.NewLendingRepository(queries)
	cr := repository.NewCreditRepository(queries)
	rr := repository.NewRepaymentRepository(queries)
	gr := repository.NewGroupRepository(queries)
	sr := repository.NewSubscriptionRepository(queries)

	lu := usecase.NewLendingUseCase(ur, gr, lr)
	cu := usecase.NewCreditUseCase(cr)
	ru := usecase.NewRepaymentUseCase(rr, cr)
	gu := usecase.NewGroupUseCase(ur, gr)
	uu := usecase.NewUserUseCase(ur, lc, avatarStorage)
	su := usecase.NewSubscriptionUseCase(sr)
	au := usecase.NewAuthUseCase(ur)

	hh := handler.NewHealthHandler()
	lh := handler.NewLendingHandler(lu)
	ch := handler.NewCreditHandler(cu)
	rh := handler.NewRepaymentHandler(ru)
	gh := handler.NewGroupHandler(gu)
	uh := handler.NewUserHandler(uu)
	sh := handler.NewSubscriptionHandler(su)
	ah := handler.NewAuthHandler(au)
	server := server.NewServer(lh, ch, hh, rh, gh, uh, sh, ah)

	e := echo.New()

	e.Use(otelecho.Middleware("github.com/haebeal/datti"))

	allowOrigins := []string{"http://localhost:3000"}
	if raw, ok := os.LookupEnv("CORS_ALLOW_ORIGINS"); ok && raw != "" {
		allowOrigins = nil
		for _, origin := range strings.Split(raw, ",") {
			trimmed := strings.TrimSpace(origin)
			if trimmed != "" {
				allowOrigins = append(allowOrigins, trimmed)
			}
		}
	}
	e.Use(echomw.CORSWithConfig(echomw.CORSConfig{
		AllowOrigins:     allowOrigins,
		AllowCredentials: true,
		AllowMethods: []string{
			http.MethodGet, http.MethodPost, http.MethodPut,
			http.MethodPatch, http.MethodDelete, http.MethodOptions,
		},
		AllowHeaders: []string{
			echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept,
			echo.HeaderAuthorization, echo.HeaderXRequestedWith,
		},
		MaxAge: 86400,
	}))

	e.Use(middleware.AuthMiddleware(middleware.AuthMiddlewareConfig{
		SkipPaths:     []string{"/health"},
		CognitoClient: cognitoClient,
	}))

	api.RegisterHandlers(e, server)

	if err = errors.Join(e.Start(fmt.Sprintf(":%s", port)), shutdown(ctx)); err != nil {
		e.Logger.Fatal(err)
		os.Exit(1)
	}
}
