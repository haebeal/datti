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

type RepaymentUseCase interface {
	Create(context.Context, RepaymentCreateInput) (*RepaymentCreateOutput, error)
	GetAll(context.Context, RepaymentGetAllInput) (*RepaymentGetAllOutput, error)
	Get(context.Context, RepaymentGetInput) (*RepaymentGetOutput, error)
	Update(context.Context, RepaymentUpdateInput) (*RepaymentUpdateOutput, error)
	Delete(context.Context, RepaymentDeleteInput) error
}

type repaymentHandler struct {
	u RepaymentUseCase
}

func NewRepaymentHandler(u RepaymentUseCase) repaymentHandler {
	return repaymentHandler{
		u: u,
	}
}

func (h repaymentHandler) Create(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "repayment.Create")
	defer span.End()

	var req api.RepaymentCreateRequest

	err := c.Bind(&req)
	if err != nil {
		message := fmt.Sprintf("RequestBody Binding Error body: %v", req)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	debtorID, err := uuid.Parse(req.DebtorId)
	if err != nil {
		message := fmt.Sprintf("DebtorId UUID Parse Error ID: %v", req.DebtorId)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	payerID, ok := c.Get("uid").(uuid.UUID)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := RepaymentCreateInput{
		PayerID:  payerID,
		DebtorID: debtorID,
		Amount:   int64(req.Amount),
	}

	output, err := h.u.Create(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to create repayment: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := &api.RepaymentCreateResponse{
		Id:        output.Repayment.ID().String(),
		PayerId:   output.Repayment.PayerID().String(),
		DebtorId:  output.Repayment.DebtorID().String(),
		Amount:    uint64(output.Repayment.Amount().Value()),
		CreatedAt: output.Repayment.CreatedAt(),
		UpdatedAt: output.Repayment.UpdatedAt(),
	}

	return c.JSON(http.StatusCreated, res)
}

func (h repaymentHandler) GetAll(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "repayment.GetAll")
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

	input := RepaymentGetAllInput{
		UserID: userID,
	}

	output, err := h.u.GetAll(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get repayments: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	responseItems := make([]api.RepaymentGetAllResponse, 0)
	for _, r := range output.Repayments {
		responseItems = append(responseItems, api.RepaymentGetAllResponse{
			Id:        r.ID().String(),
			PayerId:   r.PayerID().String(),
			DebtorId:  r.DebtorID().String(),
			Amount:    uint64(r.Amount().Value()),
			CreatedAt: r.CreatedAt(),
			UpdatedAt: r.UpdatedAt(),
		})
	}

	return c.JSON(http.StatusOK, responseItems)
}

func (h repaymentHandler) Get(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "repayment.Get")
	defer span.End()

	input := RepaymentGetInput{
		ID: id,
	}

	output, err := h.u.Get(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get repayment: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := &api.RepaymentGetResponse{
		Id:        output.Repayment.ID().String(),
		PayerId:   output.Repayment.PayerID().String(),
		DebtorId:  output.Repayment.DebtorID().String(),
		Amount:    uint64(output.Repayment.Amount().Value()),
		CreatedAt: output.Repayment.CreatedAt(),
		UpdatedAt: output.Repayment.UpdatedAt(),
	}

	return c.JSON(http.StatusOK, res)
}

func (h repaymentHandler) Update(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "repayment.Update")
	defer span.End()

	var req api.RepaymentUpdateRequest

	err := c.Bind(&req)
	if err != nil {
		message := fmt.Sprintf("RequestBody Binding Error body: %v", req)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	input := RepaymentUpdateInput{
		ID:     id,
		Amount: int64(req.Amount),
	}

	output, err := h.u.Update(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to update repayment: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	res := &api.RepaymentUpdateResponse{
		Id:        output.Repayment.ID().String(),
		PayerId:   output.Repayment.PayerID().String(),
		DebtorId:  output.Repayment.DebtorID().String(),
		Amount:    uint64(output.Repayment.Amount().Value()),
		CreatedAt: output.Repayment.CreatedAt(),
		UpdatedAt: output.Repayment.UpdatedAt(),
	}

	return c.JSON(http.StatusOK, res)
}

func (h repaymentHandler) Delete(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "repayment.Delete")
	defer span.End()

	input := RepaymentDeleteInput{
		ID: id,
	}

	err := h.u.Delete(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to delete repayment: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	return c.NoContent(http.StatusNoContent)
}

type RepaymentCreateInput struct {
	PayerID  uuid.UUID
	DebtorID uuid.UUID
	Amount   int64
}

type RepaymentCreateOutput struct {
	Repayment *domain.Repayment
}

type RepaymentGetAllInput struct {
	UserID uuid.UUID
}

type RepaymentGetAllOutput struct {
	Repayments []*domain.Repayment
}

type RepaymentGetInput struct {
	ID string
}

type RepaymentGetOutput struct {
	Repayment *domain.Repayment
}

type RepaymentUpdateInput struct {
	ID     string
	Amount int64
}

type RepaymentUpdateOutput struct {
	Repayment *domain.Repayment
}

type RepaymentDeleteInput struct {
	ID string
}
