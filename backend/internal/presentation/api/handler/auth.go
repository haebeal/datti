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

type AuthUseCase interface {
	Login(context.Context, AuthLoginInput) error
	Signup(context.Context, AuthSignupInput) (*AuthSignupOutput, error)
}

type authHandler struct {
	u AuthUseCase
}

func NewAuthHandler(u AuthUseCase) authHandler {
	return authHandler{
		u: u,
	}
}

func (h authHandler) Login(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "auth.Login")
	defer span.End()

	uid, ok := c.Get("uid").(string)
	if !ok {
		message := "認証情報が取得できませんでした"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := AuthLoginInput{
		UID: uid,
	}

	err := h.u.Login(ctx, input)
	if err != nil {
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "ユーザーが見つかりません",
			}
			return c.JSON(http.StatusUnauthorized, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	return c.NoContent(http.StatusOK)
}

func (h authHandler) Signup(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "auth.Signup")
	defer span.End()

	uid, ok := c.Get("uid").(string)
	if !ok {
		message := "認証情報が取得できませんでした"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	var req api.AuthSignupRequest
	if err := c.Bind(&req); err != nil {
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	input := AuthSignupInput{
		UID:    uid,
		Name:   req.Name,
		Email:  req.Email,
		Avatar: req.Avatar,
	}

	output, err := h.u.Signup(ctx, input)
	if err != nil {
		if errors.Is(err, &domain.ConflictError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusConflict, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := api.AuthSignupResponse{
		Id:     output.User.ID(),
		Name:   output.User.Name(),
		Email:  output.User.Email(),
		Avatar: output.User.Avatar(),
	}

	return c.JSON(http.StatusCreated, res)
}

type AuthLoginInput struct {
	UID string
}

type AuthSignupInput struct {
	UID    string
	Name   string
	Email  string
	Avatar string
}

type AuthSignupOutput struct {
	User *domain.User
}
