package main

import (
	"net/http"

	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// カスタムエラーハンドラー
func CustomErrorHandler(err error, c echo.Context) {
	var (
		code = http.StatusInternalServerError
		msg  interface{}
	)

	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
		msg = he.Message
	} else {
		msg = "Internal server error"
	}

	// ログ出力
	c.Logger().Error(err)

	// エラーレスポンス
	if !c.Response().Committed {
		if c.Request().Method == echo.HEAD {
			err = c.NoContent(code)
		} else {
			err = c.JSON(code, ErrorResponse{
				Error: msg.(string),
			})
		}
		if err != nil {
			c.Logger().Error(err)
		}
	}
}

// ミドルウェア設定
func setupMiddleware(e *echo.Echo) {
	// 基本ミドルウェア
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// リクエストID
	e.Use(middleware.RequestID())

	// セキュリティヘッダー
	e.Use(middleware.Secure())

	// レート制限（本番環境では適切な設定を）
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20)))

	// カスタムエラーハンドラー設定
	e.HTTPErrorHandler = CustomErrorHandler
}

// ヘルスチェック用の構造体
type HealthResponse struct {
	Status    string `json:"status"`
	Version   string `json:"version"`
	Timestamp string `json:"timestamp"`
}

func main() {
	// Echoインスタンス作成
	e := echo.New()
	e.HideBanner = true

	// ミドルウェア設定
	setupMiddleware(e)

	// 依存関係の注入（DI）
	paymentService := NewPaymentEventService()

	// API v1 グループ作成
	v1 := e.Group("/api/v1")

	// Bearer認証を適用
	// v1.Use(BearerAuthMiddleware())

	// oapi-codegenで生成されたハンドラー登録
	api.RegisterHandlersWithBaseURL(v1, paymentService, "")

	// ヘルスチェックエンドポイント（認証不要）
	// e.GET("/health", func(c echo.Context) error {
	// 	return c.JSON(http.StatusOK, HealthResponse{
	// 		Status:    "ok",
	// 		Version:   "1.0.0",
	// 		Timestamp: time.Now().Format(time.RFC3339),
	// 	})
	// })

	// Readiness check（実際の実装ではDBの接続確認なども含める）
	e.GET("/ready", func(c echo.Context) error {
		// データベース接続確認などのチェックを行う
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ready",
		})
	})

	// Liveness check
	e.GET("/live", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "alive",
		})
	})

	// サーバー情報エンドポイント
	e.GET("/info", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"name":        "Payment API Server",
			"version":     "1.0.0",
			"description": "Payment event management API",
			"endpoints": map[string]string{
				"health":   "/health",
				"ready":    "/ready",
				"live":     "/live",
				"payments": "/api/v1/payments",
			},
		})
	})

	// Graceful shutdown
	e.Logger.Info("Starting server on :8080")
	e.Logger.Fatal(e.Start(":8080"))
}
