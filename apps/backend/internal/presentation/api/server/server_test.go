package server

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// MockPaymentHandler は PaymentHandler のモック実装
type MockPaymentHandler struct {
	shouldReturnError bool
	errorMessage      string
}

func (m *MockPaymentHandler) Create(c echo.Context) error {
	if m.shouldReturnError {
		return errors.New(m.errorMessage)
	}
	return c.JSON(http.StatusCreated, map[string]string{"status": "created"})
}


// MockHealthHandler は HealthHandler のモック実装
type MockHealthHandler struct {
	shouldReturnError bool
	errorMessage      string
}

func (m *MockHealthHandler) Check(c echo.Context) error {
	if m.shouldReturnError {
		return errors.New(m.errorMessage)
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func TestNewServer(t *testing.T) {
	// モックハンドラーを作成
	mockPaymentHandler := &MockPaymentHandler{}
	mockHealthHandler := &MockHealthHandler{}

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
	// モックハンドラーを作成
	mockPaymentHandler := &MockPaymentHandler{shouldReturnError: false}
	mockHealthHandler := &MockHealthHandler{}

	// サーバーを作成
	server := NewServer(mockPaymentHandler, mockHealthHandler)

	// リクエストを作成
	req := httptest.NewRequest(http.MethodPost, "/payment/event", nil)
	rec := httptest.NewRecorder()
	c := echo.New().NewContext(req, rec)

	// テスト実行
	err := server.PaymentEventCreate(c)

	// アサーション
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.Contains(t, rec.Body.String(), "created")
}


func TestServer_HealthCheckCheck_Success(t *testing.T) {
	// モックハンドラーを作成
	mockPaymentHandler := &MockPaymentHandler{}
	mockHealthHandler := &MockHealthHandler{shouldReturnError: false}

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
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "ok")
}


func TestServer_Implements_ServerInterface(t *testing.T) {
	// モックハンドラーを作成
	mockPaymentHandler := &MockPaymentHandler{}
	mockHealthHandler := &MockHealthHandler{}

	// サーバーを作成
	server := NewServer(mockPaymentHandler, mockHealthHandler)

	// ServerInterfaceを実装していることを確認
	var _ handler.PaymentHandler = mockPaymentHandler
	var _ handler.HealthHandler = mockHealthHandler
	require.NotNil(t, server)
}