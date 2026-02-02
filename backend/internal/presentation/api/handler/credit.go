package handler

import (
	"context"
	"errors"
	"net/http"
	"sort"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"go.opentelemetry.io/otel/codes"
)

// CreditUseCase exposes read operations for credit summaries.
type CreditUseCase interface {
	List(ctx context.Context, input CreditListInput) (*CreditListOutput, error)
}

// CreditListInput carries parameters for listing credits from the perspective of the authenticated user.
type CreditListInput struct {
	UserID string
}

// CreditListOutput 債権/債務の一覧を返す
type CreditListOutput struct {
	Credits []*domain.Credit
}

type creditHandler struct {
	u CreditUseCase
}

func NewCreditHandler(u CreditUseCase) creditHandler {
	return creditHandler{
		u: u,
	}
}

func (h creditHandler) List(c echo.Context, params api.CreditsListParams) error {
	ctx, span := tracer.Start(c.Request().Context(), "credit.List")
	defer span.End()

	userID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := CreditListInput{UserID: userID}
	output, err := h.u.List(ctx, input)
	if err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "ユーザーが見つかりません",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	// リポジトリで残高計算済みなのでそのまま変換
	summaries := make([]api.Credit, 0, len(output.Credits))
	for _, credit := range output.Credits {
		summaries = append(summaries, api.Credit{
			UserId: credit.UserID(),
			Amount: credit.Amount(),
		})
	}

	// ソート: デフォルトは昇順（asc）
	orderBy := api.Asc
	if params.OrderBy != nil {
		orderBy = *params.OrderBy
	}

	sort.Slice(summaries, func(i, j int) bool {
		if orderBy == api.Desc {
			return summaries[i].Amount > summaries[j].Amount
		}
		return summaries[i].Amount < summaries[j].Amount
	})

	return c.JSON(http.StatusOK, summaries)
}
