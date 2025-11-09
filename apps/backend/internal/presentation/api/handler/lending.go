package handler

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type LendingUseCase interface {
	Create(context.Context, CreateInput) (*CreateOutput, error)
	Get(context.Context, GetInput) (*GetOutput, error)
	GetAll(context.Context, GetAllInput) (*GetAllOutput, error)
	Update(context.Context, UpdateInput) (*UpdateOutput, error)
}

type lendingHandler struct {
	u LendingUseCase
}

func NewLendingHandler(u LendingUseCase) lendingHandler {
	return lendingHandler{
		u: u,
	}
}

func (h lendingHandler) Create(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.Create")
	defer span.End()

	var req api.LendingCreateRequest

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

	var debtParams []DebtParam
	for _, d := range req.Debts {
		id, err := uuid.Parse(d.UserId)
		if err != nil {
			message := fmt.Sprintf("Debts UUID Parse Error ID: %v", d.UserId)
			span.SetStatus(codes.Error, message)
			span.RecordError(err)
			res := &api.ErrorResponse{
				Message: message,
			}
			return c.JSON(http.StatusBadRequest, res)
		}
		debtParams = append(debtParams, DebtParam{
			UserID: id,
			Amount: int64(d.Amount),
		})
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

	input := CreateInput{
		UserID:    userID,
		Name:      req.Name,
		Amount:    int64(req.Amount),
		Debts:     debtParams,
		EventDate: req.EventDate,
	}

	output, err := h.u.Create(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to create lending event: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	var debts []api.LendingDebtParmam
	for _, d := range output.Debtors {
		debts = append(debts, api.LendingDebtParmam{
			UserId: d.ID().String(),
			Amount: uint64(d.Amount().Value()),
		})
	}

	res := &api.LendingCreateResponse{
		Id:        output.Event.ID().String(),
		Name:      output.Event.Name(),
		Amount:    uint64(output.Event.Amount().Value()),
		EventDate: output.Event.EventDate(),
		Debts:     debts,
		CreatedAt: output.Event.CreatedAt(),
		UpdatedAt: output.Event.UpdatedAt(),
	}

	return c.JSON(http.StatusCreated, res)
}

func (h lendingHandler) Get(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.Get")
	defer span.End()

	eventID, err := ulid.Parse(id)
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

	input := GetInput{
		UserID:  userID,
		EventID: eventID,
	}

	output, err := h.u.Get(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get lending event: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	var debts []api.LendingDebtParmam
	for _, d := range output.Debtors {
		debts = append(debts, api.LendingDebtParmam{
			UserId: d.ID().String(),
			Amount: uint64(d.Amount().Value()),
		})
	}

	res := &api.LendingGetResponse{
		Id:        output.Lending.ID().String(),
		Name:      output.Lending.Name(),
		Amount:    uint64(output.Lending.Amount().Value()),
		EventDate: output.Lending.EventDate(),
		Debts:     debts,
		CreatedAt: output.Lending.CreatedAt(),
		UpdatedAt: output.Lending.UpdatedAt(),
	}

	return c.JSON(http.StatusOK, res)
}

func (h lendingHandler) GetAll(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.GetAll")
	defer span.End()

	userID, ok := c.Get("uid").(uuid.UUID)
	if !ok {
		message := "Failed to get authorized userID"
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GetAllInput{
		UserID: userID,
	}

	output, err := h.u.GetAll(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get lending events: %v", err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	var responseItems []api.LendingGetAllResponse
	for _, l := range output.Lendings {
		var debts []api.LendingDebtParmam
		for _, d := range l.Debtors {
			debts = append(debts, api.LendingDebtParmam{
				UserId: d.ID().String(),
				Amount: uint64(d.Amount().Value()),
			})
		}

		responseItems = append(responseItems, api.LendingGetAllResponse{
			Id:        l.Lending.ID().String(),
			CreatedAt: l.Lending.CreatedAt(),
			Debts:     debts,
			Amount:    uint64(l.Lending.Amount().Value()),
			Name:      l.Lending.Name(),
			EventDate: l.Lending.EventDate(),
			UpdatedAt: l.Lending.UpdatedAt(),
		})
	}

	return c.JSON(http.StatusOK, responseItems)
}

func (h lendingHandler) Update(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.Update")
	defer span.End()

	var req api.LendingUpdateRequest

	if err := c.Bind(&req); err != nil {
		message := fmt.Sprintf("RequestBody Binding Error body: %v", req)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	eventID, err := ulid.Parse(id)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", id)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var debtParams []DebtParam
	for _, d := range req.Debts {
		debtorID, err := uuid.Parse(d.UserId)
		if err != nil {
			message := fmt.Sprintf("Debts UUID Parse Error ID: %v", d.UserId)
			span.SetStatus(codes.Error, message)
			span.RecordError(err)
			res := &api.ErrorResponse{
				Message: message,
			}
			return c.JSON(http.StatusBadRequest, res)
		}
		debtParams = append(debtParams, DebtParam{
			UserID: debtorID,
			Amount: int64(d.Amount),
		})
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

	input := UpdateInput{
		UserID:    userID,
		EventID:   eventID,
		Name:      req.Name,
		Amount:    int64(req.Amount),
		Debts:     debtParams,
		EventDate: req.EventDate,
	}

	output, err := h.u.Update(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to update lending event: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	var debts []api.LendingDebtParmam
	for _, d := range output.Debtors {
		debts = append(debts, api.LendingDebtParmam{
			UserId: d.ID().String(),
			Amount: uint64(d.Amount().Value()),
		})
	}

	res := &api.LendingUpdateResponse{
		Id:        output.Lending.ID().String(),
		Name:      output.Lending.Name(),
		Amount:    uint64(output.Lending.Amount().Value()),
		EventDate: output.Lending.EventDate(),
		Debts:     debts,
		CreatedAt: output.Lending.CreatedAt(),
		UpdatedAt: output.Lending.UpdatedAt(),
	}

	return c.JSON(http.StatusOK, res)
}

type CreateInput struct {
	UserID    uuid.UUID
	Name      string
	Amount    int64
	Debts     []DebtParam
	EventDate time.Time
}
type DebtParam struct {
	UserID uuid.UUID
	Amount int64
}

type CreateOutput struct {
	Event   *domain.Lending
	Debtors []*domain.Debtor
}

type GetInput struct {
	UserID  uuid.UUID
	EventID ulid.ULID
}

type GetOutput struct {
	Lending *domain.Lending
	Debtors []*domain.Debtor
}

type GetAllInput struct {
	UserID uuid.UUID
}

type GetAllOutput struct {
	Lendings []struct {
		Lending *domain.Lending
		Debtors []*domain.Debtor
	}
}

type UpdateInput struct {
	UserID    uuid.UUID
	EventID   ulid.ULID
	Name      string
	Amount    int64
	Debts     []DebtParam
	EventDate time.Time
}

type UpdateOutput struct {
	Lending *domain.Lending
	Debtors []*domain.Debtor
}
