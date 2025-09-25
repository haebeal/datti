package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/haebeal/datti/internal/presentation/api/server/testutil"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// MockHealthHandler は HealthHandler のモック実装
func TestNewServer(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// モックハンドラーを作成
	mockHealthHandler := testutil.NewMockHealthHandler(ctrl)
	mockPaymentHandler := testutil.NewMockPaymentHandler(ctrl)

	// NewServer関数をテスト
	server := NewServer(mockPaymentHandler, mockHealthHandler)

	// サーバーが正しく作成されることを確認
	require.NotNil(t, server)
	assert.IsType(t, &Server{}, server)

	// 内部のハンドラーが正しく設定されることを確認
	serverStruct := server.(*Server)
	assert.Equal(t, mockPaymentHandler, serverStruct.ph)
	assert.Equal(t, mockHealthHandler, serverStruct.hh)
}

func TestServer_PaymentEventCreate_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// モックハンドラーを作成
	mockHealthHandler := testutil.NewMockHealthHandler(ctrl)
	mockPaymentHandler := testutil.NewMockPaymentHandler(ctrl)
	mockPaymentHandler.EXPECT().Create(gomock.Any()).Return(nil)

	// サーバーを作成
	server := NewServer(mockPaymentHandler, mockHealthHandler)

	// リクエストを作成
	req := httptest.NewRequest(http.MethodPost, "/payments/events", nil)
	rec := httptest.NewRecorder()
	c := echo.New().NewContext(req, rec)

	// テスト実行
	err := server.PaymentEventCreate(c)

	// アサーション
	assert.NoError(t, err)
}

func TestServer_PaymentEventGet_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// モックハンドラーを作成
	mockHealthHandler := testutil.NewMockHealthHandler(ctrl)
	mockPaymentHandler := testutil.NewMockPaymentHandler(ctrl)
	mockPaymentHandler.EXPECT().Get(gomock.Any(), gomock.Any()).Return(nil)

	// サーバーを作成
	server := NewServer(mockPaymentHandler, mockHealthHandler)

	// リクエストを作成
	req := httptest.NewRequest(http.MethodGet, "/payments/events/hoge", nil)
	rec := httptest.NewRecorder()
	c := echo.New().NewContext(req, rec)

	// テスト実行
	err := server.PaymentEventGet(c, "hoge")

	// アサーション
	assert.NoError(t, err)
}

func TestServer_HealthCheckCheck_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// モックハンドラーを作成
	mockHealthHandler := testutil.NewMockHealthHandler(ctrl)
	mockHealthHandler.EXPECT().Check(gomock.Any()).Return(nil)
	mockPaymentHandler := testutil.NewMockPaymentHandler(ctrl)

	// サーバーを作成
	server := NewServer(mockPaymentHandler, mockHealthHandler)

	// リクエストを作成
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	c := echo.New().NewContext(req, rec)

	// テスト実行
	err := server.HealthCheckCheck(c)

	// アサーション
	assert.NoError(t, err)
}

func TestServer_Implements_ServerInterface(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// モックハンドラーを作成
	mockHealthHandler := testutil.NewMockHealthHandler(ctrl)
	mockPaymentHandler := testutil.NewMockPaymentHandler(ctrl)

	// サーバーを作成
	server := NewServer(mockPaymentHandler, mockHealthHandler)

	// ServerInterfaceを実装していることを確認
	var _ handler.PaymentHandler = mockPaymentHandler
	var _ handler.HealthHandler = mockHealthHandler
	require.NotNil(t, server)
}
