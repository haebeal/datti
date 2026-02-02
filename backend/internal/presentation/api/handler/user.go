package handler

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"go.opentelemetry.io/otel/codes"
)

// UserUseCase ユーザーに関するユースケースのインターフェース
type UserUseCase interface {
	Search(context.Context, UserSearchInput) (*UserSearchOutput, error)
	Get(context.Context, UserGetInput) (*UserGetOutput, error)
	GetMe(context.Context, UserGetMeInput) (*UserGetMeOutput, error)
	UpdateMe(context.Context, UserUpdateMeInput) (*UserUpdateMeOutput, error)
}

type userHandler struct {
	u UserUseCase
}

// NewUserHandler userHandlerのファクトリ関数
func NewUserHandler(u UserUseCase) userHandler {
	return userHandler{
		u: u,
	}
}

// Search ユーザーを名前またはメールアドレスで検索する
func (h userHandler) Search(c echo.Context, params api.UserSearchParams) error {
	ctx, span := tracer.Start(c.Request().Context(), "user.Search")
	defer span.End()

	if _, ok := c.Get("uid").(string); !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
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
		res := &api.ErrorResponse{
			Message: "名前またはメールアドレスを指定してください",
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
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
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

// UserSearchInput ユーザー検索の入力パラメータ
type UserSearchInput struct {
	Name  string
	Email string
	Limit int32
}

// UserSearchOutput ユーザー検索の出力
type UserSearchOutput struct {
	Users []*domain.User
}

// Get 指定したIDのユーザー情報を取得する
func (h userHandler) Get(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "user.Get")
	defer span.End()

	if _, ok := c.Get("uid").(string); !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := UserGetInput{
		ID: id,
	}

	output, err := h.u.Get(ctx, input)
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

	res := api.UserGetResponse{
		Id:     output.User.ID(),
		Name:   output.User.Name(),
		Avatar: output.User.Avatar(),
		Email:  output.User.Email(),
	}

	return c.JSON(http.StatusOK, res)
}

// GetMe 認証ユーザー自身の情報を取得する
func (h userHandler) GetMe(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "user.GetMe")
	defer span.End()

	uid, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := UserGetMeInput{
		UID: uid,
	}

	output, err := h.u.GetMe(ctx, input)
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

	res := api.UserGetResponse{
		Id:     output.User.ID(),
		Name:   output.User.Name(),
		Avatar: output.User.Avatar(),
		Email:  output.User.Email(),
	}

	return c.JSON(http.StatusOK, res)
}

// UpdateMe 認証ユーザー自身の情報を更新する
func (h userHandler) UpdateMe(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "user.UpdateMe")
	defer span.End()

	uid, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	var req api.UserUpdateRequest
	if err := c.Bind(&req); err != nil {
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	input := UserUpdateMeInput{
		UID:    uid,
		Name:   req.Name,
		Avatar: req.Avatar,
	}

	output, err := h.u.UpdateMe(ctx, input)
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

	res := api.UserGetResponse{
		Id:     output.User.ID(),
		Name:   output.User.Name(),
		Avatar: output.User.Avatar(),
		Email:  output.User.Email(),
	}

	return c.JSON(http.StatusOK, res)
}

// UserGetInput ユーザー取得の入力パラメータ
type UserGetInput struct {
	ID string
}

// UserGetOutput ユーザー取得の出力
type UserGetOutput struct {
	User *domain.User
}

// UserGetMeInput 自身の情報取得の入力パラメータ
type UserGetMeInput struct {
	UID string
}

// UserGetMeOutput 自身の情報取得の出力
type UserGetMeOutput struct {
	User *domain.User
}

// UserUpdateMeInput 自身の情報更新の入力パラメータ
type UserUpdateMeInput struct {
	UID    string
	Name   string
	Avatar string
}

// UserUpdateMeOutput 自身の情報更新の出力
type UserUpdateMeOutput struct {
	User *domain.User
}
