package handler

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type GroupUseCase interface {
	Create(context.Context, GroupCreateInput) (*GroupCreateOutput, error)
	GetAll(context.Context, GroupGetAllInput) (*GroupGetAllOutput, error)
	Get(context.Context, GroupGetInput) (*GroupGetOutput, error)
	Update(context.Context, GroupUpdateInput) (*GroupUpdateOutput, error)
	AddMember(context.Context, GroupAddMemberInput) error
	RemoveMember(context.Context, GroupRemoveMemberInput) error
	ListMembers(context.Context, GroupListMembersInput) (*GroupListMembersOutput, error)
}

type groupHandler struct {
	u GroupUseCase
}

func NewGroupHandler(u GroupUseCase) groupHandler {
	return groupHandler{
		u: u,
	}
}

func (h groupHandler) Create(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.Create")
	defer span.End()

	var req api.GroupCreateRequest
	if err := c.Bind(&req); err != nil {
		message := fmt.Sprintf("RequestBody Binding Error body: %v", req)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	createdBy, ok := c.Get("uid").(string)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupCreateInput{
		CreatedBy: createdBy,
		Name:      req.Name,
	}

	output, err := h.u.Create(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to create group: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
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

func (h groupHandler) GetAll(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.GetAll")
	defer span.End()

	userID, ok := c.Get("uid").(string)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupGetAllInput{
		UserID: userID,
	}

	output, err := h.u.GetAll(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get groups: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
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

func (h groupHandler) Get(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.Get")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", id)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupGetInput{
		UserID:  userID,
		GroupID: groupID,
	}

	output, err := h.u.Get(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get group: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		if err.Error() == "forbidden Error" {
			return c.JSON(http.StatusForbidden, res)
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

func (h groupHandler) Update(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.Update")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", id)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var req api.GroupUpdateRequest
	if err := c.Bind(&req); err != nil {
		message := fmt.Sprintf("RequestBody Binding Error body: %v", req)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
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
		message := fmt.Sprintf("Failed to update group: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		if err.Error() == "forbidden Error" {
			return c.JSON(http.StatusForbidden, res)
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

func (h groupHandler) AddMember(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.AddMember")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", id)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var req api.GroupAddMemberRequest
	if err := c.Bind(&req); err != nil {
		message := fmt.Sprintf("RequestBody Binding Error body: %v", req)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupAddMemberInput{
		UserID:   userID,
		GroupID:  groupID,
		MemberID: req.UserId,
	}

	if err := h.u.AddMember(ctx, input); err != nil {
		message := fmt.Sprintf("Failed to add group member: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		if errors.Is(err, domain.ErrGroupMemberAlreadyExists) {
			return c.JSON(http.StatusConflict, res)
		}
		if err.Error() == "forbidden Error" {
			return c.JSON(http.StatusForbidden, res)
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	return c.NoContent(http.StatusNoContent)
}

func (h groupHandler) GetMembers(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.GetMembers")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", id)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupListMembersInput{
		UserID:  userID,
		GroupID: groupID,
	}

	output, err := h.u.ListMembers(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get group members: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		if err.Error() == "forbidden Error" {
			return c.JSON(http.StatusForbidden, res)
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

func (h groupHandler) RemoveMember(c echo.Context, id string, userId string) error {
	ctx, span := tracer.Start(c.Request().Context(), "group.RemoveMember")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", id)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	userID, ok := c.Get("uid").(string)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupRemoveMemberInput{
		UserID:   userID,
		GroupID:  groupID,
		MemberID: userId,
	}

	if err := h.u.RemoveMember(ctx, input); err != nil {
		message := fmt.Sprintf("Failed to remove group member: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		if err.Error() == "forbidden Error" {
			return c.JSON(http.StatusForbidden, res)
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	return c.NoContent(http.StatusNoContent)
}

type GroupCreateInput struct {
	CreatedBy string
	Name      string
}

type GroupCreateOutput struct {
	Group *domain.Group
}

type GroupGetAllInput struct {
	UserID string
}

type GroupGetAllOutput struct {
	Groups []*domain.Group
}

type GroupGetInput struct {
	UserID  string
	GroupID ulid.ULID
}

type GroupGetOutput struct {
	Group *domain.Group
}

type GroupUpdateInput struct {
	UserID  string
	GroupID ulid.ULID
	Name    string
}

type GroupUpdateOutput struct {
	Group *domain.Group
}

type GroupAddMemberInput struct {
	UserID   string
	GroupID  ulid.ULID
	MemberID string
}

type GroupListMembersInput struct {
	UserID  string
	GroupID ulid.ULID
}

type GroupListMembersOutput struct {
	Members []*domain.User
}

type GroupRemoveMemberInput struct {
	UserID   string
	GroupID  ulid.ULID
	MemberID string
}
