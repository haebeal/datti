package handler

import (
	"context"
	"errors"
	"net/http"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

// GroupUseCase グループに関するユースケースのインターフェース
type GroupUseCase interface {
	Create(context.Context, GroupCreateInput) (*GroupCreateOutput, error)
	GetAll(context.Context, GroupGetAllInput) (*GroupGetAllOutput, error)
	Get(context.Context, GroupGetInput) (*GroupGetOutput, error)
	Update(context.Context, GroupUpdateInput) (*GroupUpdateOutput, error)
	Delete(context.Context, GroupDeleteInput) error
	AddMember(context.Context, GroupAddMemberInput) error
	RemoveMember(context.Context, GroupRemoveMemberInput) error
	ListMembers(context.Context, GroupListMembersInput) (*GroupListMembersOutput, error)
}

type groupHandler struct {
	u GroupUseCase
}

// NewGroupHandler groupHandlerのファクトリ関数
func NewGroupHandler(u GroupUseCase) groupHandler {
	return groupHandler{
		u: u,
	}
}

// Create グループを新規作成する
func (h groupHandler) Create(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.Create")
	defer span.End()

	var req api.GroupCreateRequest
	if err := c.Bind(&req); err != nil {
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	createdBy, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupCreateInput{
		CreatedBy: createdBy,
		Name:      req.Name,
	}

	output, err := h.u.Create(ctx, input)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := &api.GroupCreateResponse{
		CreatedBy: output.Group.CreatedBy(),
		Id:        output.Group.ID().String(),
		Name:      output.Group.Name(),
		CreatedAt: output.Group.CreatedAt(),
		UpdatedAt: output.Group.UpdatedAt(),
	}

	return c.JSON(http.StatusCreated, res)
}

// GetAll 認証ユーザーが所属する全グループを取得する
func (h groupHandler) GetAll(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.GetAll")
	defer span.End()

	userID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupGetAllInput{
		UserID: userID,
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

	res := []api.GroupGetAllResponse{}
	for _, group := range output.Groups {
		res = append(res, api.GroupGetAllResponse{
			Id:        group.ID().String(),
			Name:      group.Name(),
			CreatedBy: group.CreatedBy(),
			CreatedAt: group.CreatedAt(),
			UpdatedAt: group.UpdatedAt(),
		})
	}

	return c.JSON(http.StatusOK, res)
}

// Get 指定したIDのグループ情報を取得する
func (h groupHandler) Get(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.Get")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupGetInput{
		UserID:  userID,
		GroupID: groupID,
	}

	output, err := h.u.Get(ctx, input)
	if err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "グループが見つかりません",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		
		if errors.Is(err, &domain.ForbiddenError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusForbidden, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := &api.GroupGetResponse{
		Id:        output.Group.ID().String(),
		Name:      output.Group.Name(),
		CreatedBy: output.Group.CreatedBy(),
		CreatedAt: output.Group.CreatedAt(),
		UpdatedAt: output.Group.UpdatedAt(),
	}

	return c.JSON(http.StatusOK, res)
}

// Update グループ情報を更新する
func (h groupHandler) Update(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.Update")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var req api.GroupUpdateRequest
	if err := c.Bind(&req); err != nil {
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupUpdateInput{
		UserID:  userID,
		GroupID: groupID,
		Name:    req.Name,
	}

	output, err := h.u.Update(ctx, input)
	if err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "グループが見つかりません",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		
		if errors.Is(err, &domain.ForbiddenError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusForbidden, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := &api.GroupUpdateResponse{
		Id:        output.Group.ID().String(),
		Name:      output.Group.Name(),
		CreatedBy: output.Group.CreatedBy(),
		CreatedAt: output.Group.CreatedAt(),
		UpdatedAt: output.Group.UpdatedAt(),
	}

	return c.JSON(http.StatusOK, res)
}

// Delete グループを削除する
func (h groupHandler) Delete(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.Delete")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupDeleteInput{
		UserID:  userID,
		GroupID: groupID,
	}

	if err := h.u.Delete(ctx, input); err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "グループが見つかりません",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		
		if errors.Is(err, &domain.ForbiddenError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusForbidden, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	return c.NoContent(http.StatusNoContent)
}

// AddMember グループにメンバーを追加する
func (h groupHandler) AddMember(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.AddMember")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var req api.GroupAddMemberRequest
	if err := c.Bind(&req); err != nil {
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupAddMemberInput{
		UserID:   userID,
		GroupID:  groupID,
		MemberID: req.UserId,
	}

	if err := h.u.AddMember(ctx, input); err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "メンバーが見つかりません",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		
		if errors.Is(err, &domain.ConflictError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusConflict, res)
		}
		
		if errors.Is(err, &domain.ForbiddenError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusForbidden, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	return c.NoContent(http.StatusNoContent)
}

// GetMembers グループのメンバー一覧を取得する
func (h groupHandler) GetMembers(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.GetMembers")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupListMembersInput{
		UserID:  userID,
		GroupID: groupID,
	}

	output, err := h.u.ListMembers(ctx, input)
	if err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "グループが見つかりません",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		
		if errors.Is(err, &domain.ForbiddenError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusForbidden, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := make([]api.GroupMemberResponse, 0, len(output.Members))
	for _, member := range output.Members {
		res = append(res, api.GroupMemberResponse{
			Id:     member.ID(),
			Name:   member.Name(),
			Avatar: member.Avatar(),
			Email:  member.Email(),
		})
	}

	return c.JSON(http.StatusOK, res)
}

// RemoveMember グループからメンバーを削除する
func (h groupHandler) RemoveMember(c echo.Context, id string, userId string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.RemoveMember")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupRemoveMemberInput{
		UserID:   userID,
		GroupID:  groupID,
		MemberID: userId,
	}

	if err := h.u.RemoveMember(ctx, input); err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "メンバーが見つかりません",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		
		if errors.Is(err, &domain.ForbiddenError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusForbidden, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	return c.NoContent(http.StatusNoContent)
}

// GroupCreateInput グループ作成の入力パラメータ
type GroupCreateInput struct {
	CreatedBy string
	Name      string
}

// GroupCreateOutput グループ作成の出力
type GroupCreateOutput struct {
	Group *domain.Group
}

// GroupGetAllInput グループ一覧取得の入力パラメータ
type GroupGetAllInput struct {
	UserID string
}

// GroupGetAllOutput グループ一覧取得の出力
type GroupGetAllOutput struct {
	Groups []*domain.Group
}

// GroupGetInput グループ取得の入力パラメータ
type GroupGetInput struct {
	UserID  string
	GroupID ulid.ULID
}

// GroupGetOutput グループ取得の出力
type GroupGetOutput struct {
	Group *domain.Group
}

// GroupUpdateInput グループ更新の入力パラメータ
type GroupUpdateInput struct {
	UserID  string
	GroupID ulid.ULID
	Name    string
}

// GroupUpdateOutput グループ更新の出力
type GroupUpdateOutput struct {
	Group *domain.Group
}

// GroupDeleteInput グループ削除の入力パラメータ
type GroupDeleteInput struct {
	UserID  string
	GroupID ulid.ULID
}

// GroupAddMemberInput メンバー追加の入力パラメータ
type GroupAddMemberInput struct {
	UserID   string
	GroupID  ulid.ULID
	MemberID string
}

// GroupListMembersInput メンバー一覧取得の入力パラメータ
type GroupListMembersInput struct {
	UserID  string
	GroupID ulid.ULID
}

// GroupListMembersOutput メンバー一覧取得の出力
type GroupListMembersOutput struct {
	Members []*domain.User
}

// GroupRemoveMemberInput メンバー削除の入力パラメータ
type GroupRemoveMemberInput struct {
	UserID   string
	GroupID  ulid.ULID
	MemberID string
}
