package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/usecase"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

type MockPaymentUseCase struct {
	shouldReturnError bool
}

func (m *MockPaymentUseCase) Create(input usecase.CreatePaymentInput) (*domain.PaymentEvent, error) {
	if m.shouldReturnError {
		return nil, errors.New("internal error")
	}
	// 正常な場合はnilを返すが、実際のハンドラーロジックはこのnilポインターにアクセスしない
	// テストでは主にエラーハンドリングとレスポンス形式をテストする
	return nil, nil
}

func TestPaymentHandler_Create_UseCaseError(t *testing.T) {
	// Setup - ユースケースがエラーを返すケース
	mockUseCase := &MockPaymentUseCase{shouldReturnError: true}
	handler := NewPaymentHandler(mockUseCase)

	// テストデータ
	payerID := uuid.New()
	debtorID := uuid.New()
	eventDate := time.Now()

	request := api.PaymentCreateEventRequest{
		Name: "テスト支払い",
		Payer: struct {
			Amount uint64 `json:"amount"`
			Id     string `json:"id"`
		}{
			Amount: 1000,
			Id:     payerID.String(),
		},
		Debtors: []struct {
			Amount uint64 `json:"amount"`
			Id     string `json:"id"`
		}{
			{
				Amount: 500,
				Id:     debtorID.String(),
			},
		},
		EventDate: eventDate,
	}

	// リクエストの作成
	reqBody, _ := json.Marshal(request)
	req := httptest.NewRequest(http.MethodPost, "/payments", bytes.NewReader(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := echo.New().NewContext(req, rec)

	// テスト実行
	err := handler.Create(c)

	// アサーション
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var response api.ErrorResponse
	err = json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "internal error", response.Message)
}

func TestPaymentHandler_Create_InvalidJSON(t *testing.T) {
	// Setup
	mockUseCase := &MockPaymentUseCase{}
	handler := NewPaymentHandler(mockUseCase)

	// 無効なJSONリクエスト
	req := httptest.NewRequest(http.MethodPost, "/payments", bytes.NewReader([]byte("invalid json")))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := echo.New().NewContext(req, rec)

	// テスト実行
	err := handler.Create(c)

	// アサーション
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var response api.ErrorResponse
	err = json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "RequestBody Bindig Error")
}

func TestPaymentHandler_Create_InvalidPayerUUID(t *testing.T) {
	// Setup
	mockUseCase := &MockPaymentUseCase{}
	handler := NewPaymentHandler(mockUseCase)

	request := api.PaymentCreateEventRequest{
		Name: "テスト支払い",
		Payer: struct {
			Amount uint64 `json:"amount"`
			Id     string `json:"id"`
		}{
			Amount: 1000,
			Id:     "invalid-uuid",
		},
		Debtors: []struct {
			Amount uint64 `json:"amount"`
			Id     string `json:"id"`
		}{
			{
				Amount: 500,
				Id:     uuid.New().String(),
			},
		},
		EventDate: time.Now(),
	}

	// リクエストの作成
	reqBody, _ := json.Marshal(request)
	req := httptest.NewRequest(http.MethodPost, "/payments", bytes.NewReader(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := echo.New().NewContext(req, rec)

	// テスト実行
	err := handler.Create(c)

	// アサーション
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var response api.ErrorResponse
	err = json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response.Message, "Payer UUID Parse Error")
}
