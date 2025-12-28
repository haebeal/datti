package handler

import (
	"context"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"go.opentelemetry.io/otel/codes"
)

type GroupUseCase interface {
	Create(context.Context, GroupCreateInput) (*GroupCreateOutput, error)
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

type GroupCreateInput struct {
	OwnerID uuid.UUID
	Name    string
}

type GroupCreateOutput struct {
	Group *domain.Group
}
