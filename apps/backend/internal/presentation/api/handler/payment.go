package api

import (
	"net/http"

	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/usecase"
	"github.com/labstack/echo/v4"
)

type PaymentEventHandler struct {
	pu usecase.PaymentUseCase
}

func NewPaymentEventhandler(pu usecase.PaymentUseCase) *PaymentEventHandler {
	return &PaymentEventHandler{
		pu: pu,
	}
}

func (h *PaymentEventHandler) CreatePaymentEventCreatePaymentEvent(ctx echo.Context) error {
	// リクエストボディのバインド
	var req api.CreatePaymentEventCreatePaymentEventJSONRequestBody
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body: " + err.Error(),
		})
	}

	// バリデーション
	if err := h.validateRequest(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}

	// Usecaseレイヤーの呼び出し
	// TODO: req.Debtorsの詰め替え問題を解決する
	result, err := h.pu.Create(
		req.Name, int64(req.Payer.Amount), req.Payer.User.Id, req.EventDate, req.Debtors
	)

	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Internal server error",
		})
	}

	// TODO: レスポンスの構築

	return ctx.JSON(http.StatusCreated, result)
}

// validateRequest はリクエストの基本的なバリデーション
func (h *PaymentEventHandler) validateRequest(req *api.PaymentEvent) error {
	if req.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "name is required")
	}

	if req.Payer.User.Id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "payer user id is required")
	}

	if req.Payer.Amount == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "payer amount must be greater than 0")
	}

	if len(req.Debtors) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "at least one debtor is required")
	}

	for i, debtor := range req.Debtors {
		if debtor.User.Id == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "debtor user id is required at index %d", i)
		}
		if debtor.Amount == 0 {
			return echo.NewHTTPError(http.StatusBadRequest, "debtor amount must be greater than 0 at index %d", i)
		}
	}

	return nil
}

// TODO: convertDebtorsInput はAPI型からUsecase入力型に変換
// TODO: convertDebtorsOutput はUsecase出力型からAPI型に変換
