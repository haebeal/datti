package handler

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"go.opentelemetry.io/otel/codes"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
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
		message := "Failed to get authorized userID"
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
		if errors.Is(err, ErrUserNotFound) {
			res := &api.ErrorResponse{
				Message: "User not found",
			}
			return c.JSON(http.StatusUnauthorized, res)
		}
		message := fmt.Sprintf("Failed to login: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
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
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	var req api.AuthSignupRequest
	if err := c.Bind(&req); err != nil {
		message := fmt.Sprintf("Invalid request body: %v", err)
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
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
		if errors.Is(err, ErrUserAlreadyExists) {
			res := &api.ErrorResponse{
				Message: "User already exists",
			}
			return c.JSON(http.StatusConflict, res)
		}
		message := fmt.Sprintf("Failed to signup: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
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
