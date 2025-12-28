package handler

import (
	"context"
	"fmt"
	"net/http"

	"github.com/google/uuid"
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

	ownerID, ok := c.Get("uid").(uuid.UUID)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GroupCreateInput{
		OwnerID: ownerID,
		Name:    req.Name,
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
		CreatedBy: output.Group.OwnerID().String(),
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

	userID, ok := c.Get("uid").(uuid.UUID)
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
			CreatedBy: group.OwnerID().String(),
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

	userID, ok := c.Get("uid").(uuid.UUID)
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
		CreatedBy: output.Group.OwnerID().String(),
		CreatedAt: output.Group.CreatedAt(),
		UpdatedAt: output.Group.UpdatedAt(),
	}

	return c.JSON(http.StatusOK, res)
}

type GroupCreateInput struct {
	OwnerID uuid.UUID
	Name    string
}

type GroupCreateOutput struct {
	Group *domain.Group
}

type GroupGetAllInput struct {
	UserID uuid.UUID
}

type GroupGetAllOutput struct {
	Groups []*domain.Group
}

type GroupGetInput struct {
	UserID  uuid.UUID
	GroupID ulid.ULID
}

type GroupGetOutput struct {
	Group *domain.Group
}
