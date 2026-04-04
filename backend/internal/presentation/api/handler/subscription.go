package handler

import (
	"context"
	"errors"
	"net/http"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"go.opentelemetry.io/otel/codes"
)

// SubscriptionUseCase 通知購読に関するユースケースのインターフェース
type SubscriptionUseCase interface {
	GetAll(context.Context, SubscriptionGetAllInput) (*SubscriptionGetAllOutput, error)
	Upsert(context.Context, SubscriptionUpsertInput) (*SubscriptionUpsertOutput, error)
	Delete(context.Context, SubscriptionDeleteInput) error
}

type subscriptionHandler struct {
	u SubscriptionUseCase
}

// NewSubscriptionHandler subscriptionHandlerのファクトリ関数
func NewSubscriptionHandler(u SubscriptionUseCase) subscriptionHandler {
	return subscriptionHandler{
		u: u,
	}
}

// GetAll 通知購���一覧を取得する
func (h subscriptionHandler) GetAll(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "subscription.GetAll")
	defer span.End()

	uid, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := SubscriptionGetAllInput{
		UID: uid,
	}

	output, err := h.u.GetAll(ctx, input)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := make([]api.SubscriptionGetResponse, 0, len(output.Subscriptions))
	for _, s := range output.Subscriptions {
		res = append(res, api.SubscriptionGetResponse{
			Channel:       api.SubscriptionGetResponseChannel(s.Channel()),
			EventFiring:   s.EventFiring(),
			WeeklySummary: s.WeeklySummary(),
		})
	}

	return c.JSON(http.StatusOK, res)
}

// Upsert 通知購読を更新する
func (h subscriptionHandler) Upsert(c echo.Context, channel api.SubscriptionUpsertParamsChannel) error {
	ctx, span := tracer.Start(c.Request().Context(), "subscription.Upsert")
	defer span.End()

	uid, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	var req api.SubscriptionUpsertRequest
	if err := c.Bind(&req); err != nil {
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	input := SubscriptionUpsertInput{
		UID:           uid,
		Channel:       string(channel),
		EventFiring:   req.EventFiring,
		WeeklySummary: req.WeeklySummary,
	}

	output, err := h.u.Upsert(ctx, input)
	if err != nil {
		if errors.Is(err, &domain.ValidationError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusBadRequest, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := api.SubscriptionGetResponse{
		Channel:       api.SubscriptionGetResponseChannel(output.Subscription.Channel()),
		EventFiring:   output.Subscription.EventFiring(),
		WeeklySummary: output.Subscription.WeeklySummary(),
	}

	return c.JSON(http.StatusOK, res)
}

// Delete 通知購読を削除する
func (h subscriptionHandler) Delete(c echo.Context, channel api.SubscriptionDeleteParamsChannel) error {
	ctx, span := tracer.Start(c.Request().Context(), "subscription.Delete")
	defer span.End()

	uid, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := SubscriptionDeleteInput{
		UID:     uid,
		Channel: string(channel),
	}

	if err := h.u.Delete(ctx, input); err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	return c.NoContent(http.StatusNoContent)
}

// SubscriptionGetAllInput 通知購読一覧取得の入力パラメータ
type SubscriptionGetAllInput struct {
	UID string
}

// SubscriptionGetAllOutput 通知購読一覧取得の出力
type SubscriptionGetAllOutput struct {
	Subscriptions []*domain.Subscription
}

// SubscriptionUpsertInput 通知購読更新の入力パラメータ
type SubscriptionUpsertInput struct {
	UID           string
	Channel       string
	EventFiring   bool
	WeeklySummary bool
}

// SubscriptionUpsertOutput 通知購読更新の出力
type SubscriptionUpsertOutput struct {
	Subscription *domain.Subscription
}

// SubscriptionDeleteInput 通知購読削除の入力パラメータ
type SubscriptionDeleteInput struct {
	UID     string
	Channel string
}
