package handler

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"go.opentelemetry.io/otel/codes"
)

type UserUseCase interface {
	Search(context.Context, UserSearchInput) (*UserSearchOutput, error)
	Get(context.Context, UserGetInput) (*UserGetOutput, error)
	GetMe(context.Context, UserGetMeInput) (*UserGetMeOutput, error)
	Update(context.Context, UserUpdateInput) (*UserUpdateOutput, error)
}

type userHandler struct {
	u UserUseCase
}

func NewUserHandler(u UserUseCase) userHandler {
	return userHandler{
		u: u,
	}
}

func (h userHandler) Search(c echo.Context, params api.UserSearchParams) error {
	ctx, span := tracer.Start(c.Request().Context(), "user.Search")
	defer span.End()

	if _, ok := c.Get("uid").(string); !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	name := ""
	if params.Name != nil {
		name = strings.TrimSpace(*params.Name)
	}
	email := ""
	if params.Email != nil {
		email = strings.TrimSpace(*params.Email)
	}

	if name == "" && email == "" {
		message := "name or email is required"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var limit int32
	if params.Limit != nil {
		limit = *params.Limit
	}

	input := UserSearchInput{
		Name:  name,
		Email: email,
		Limit: limit,
	}

	output, err := h.u.Search(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to search users: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := make([]api.UserSearchResponse, 0, len(output.Users))
	for _, user := range output.Users {
		res = append(res, api.UserSearchResponse{
			Id:     user.ID(),
			Name:   user.Name(),
			Avatar: user.Avatar(),
			Email:  user.Email(),
		})
	}

	return c.JSON(http.StatusOK, res)
}

type UserSearchInput struct {
	Name  string
	Email string
	Limit int32
}

type UserSearchOutput struct {
	Users []*domain.User
}

func (h userHandler) Get(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "user.Get")
	defer span.End()

	if _, ok := c.Get("uid").(string); !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := UserGetInput{
		ID: id,
	}

	output, err := h.u.Get(ctx, input)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			res := &api.ErrorResponse{
				Message: "User not found",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		message := fmt.Sprintf("Failed to get user: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := api.UserGetResponse{
		Id:     output.User.ID(),
		Name:   output.User.Name(),
		Avatar: output.User.Avatar(),
		Email:  output.User.Email(),
	}

	return c.JSON(http.StatusOK, res)
}

func (h userHandler) GetMe(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "user.GetMe")
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

	input := UserGetMeInput{
		UID: uid,
	}

	output, err := h.u.GetMe(ctx, input)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			res := &api.ErrorResponse{
				Message: "User not found",
			}
			return c.JSON(http.StatusUnauthorized, res)
		}
		message := fmt.Sprintf("Failed to get user: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := api.UserGetResponse{
		Id:     output.User.ID(),
		Name:   output.User.Name(),
		Avatar: output.User.Avatar(),
		Email:  output.User.Email(),
	}

	return c.JSON(http.StatusOK, res)
}

func (h userHandler) Update(c echo.Context, _ string) error {
	ctx, span := tracer.Start(c.Request().Context(), "user.Update")
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

	var req api.UserUpdateRequest
	if err := c.Bind(&req); err != nil {
		message := fmt.Sprintf("Invalid request body: %v", err)
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	input := UserUpdateInput{
		UID:    uid,
		Name:   req.Name,
		Avatar: req.Avatar,
	}

	output, err := h.u.Update(ctx, input)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			res := &api.ErrorResponse{
				Message: "User not found",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		message := fmt.Sprintf("Failed to update user: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := api.UserGetResponse{
		Id:     output.User.ID(),
		Name:   output.User.Name(),
		Avatar: output.User.Avatar(),
		Email:  output.User.Email(),
	}

	return c.JSON(http.StatusOK, res)
}

type UserGetInput struct {
	ID string
}

type UserGetOutput struct {
	User *domain.User
}

type UserGetMeInput struct {
	UID string
}

type UserGetMeOutput struct {
	User *domain.User
}

type UserUpdateInput struct {
	UID    string
	Name   string
	Avatar string
}

type UserUpdateOutput struct {
	User *domain.User
}
