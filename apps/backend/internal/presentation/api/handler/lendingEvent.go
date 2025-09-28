package handler

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"github.com/oklog/ulid/v2"
)

type LendingEventUseCase interface {
	Create(CreateInput) (CreateOutput, error)
	Get(GetInput) (*GetOutput, error)
}

type lendingEventHandler struct {
	u LendingEventUseCase
}

func NewLendingEventHandler(u LendingEventUseCase) lendingEventHandler {
	return lendingEventHandler{
		u: u,
	}
}

func (h lendingEventHandler) Create(c echo.Context) error {
	var req api.LendingCreateLendingEventRequest

	err := c.Bind(req)
	if err != nil {
		message := fmt.Sprintf("RequestBody Bindig Error body: %v", req)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var debtParams []DebtParam
	for _, d := range req.Debts {
		id, err := uuid.Parse(d.UserId)
		if err != nil {
			message := fmt.Sprintf("Debs UUID Parse Error ID: %v", d.UserId)
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

	uid, ok := c.Get("uid").(string)
	if !ok {
		message := "Failed to get authorized userID"
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}
	userID, err := uuid.Parse(uid)
	if err != nil {
		message := fmt.Sprintf("Failed to get authorized userID: %v", err)
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

	output, err := h.u.Create(input)
	if err != nil {
		message := fmt.Sprintf("Failed to create lending event: %v", err)
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

	res := &api.LendingCreateLendingEventResponse{
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

func (h lendingEventHandler) Get(c echo.Context, id string) error {
	eventID, err := ulid.Parse(id)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", id)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	uid, ok := c.Get("uid").(string)
	if !ok {
		message := "Failed to get authorized userID"
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}
	userID, err := uuid.Parse(uid)
	if err != nil {
		message := fmt.Sprintf("Failed to get authorized userID: %v", err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GetInput{
		UserID:  userID,
		EventID: eventID,
	}

	output, err := h.u.Get(input)
	if err != nil {
		message := fmt.Sprintf("Failed to get lending event: %v", err)
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

	res := &api.LendingGetLendingEventResponse{
		Id:        output.Event.ID().String(),
		Name:      output.Event.Name(),
		Amount:    uint64(output.Event.Amount().Value()),
		EventDate: output.Event.EventDate(),
		Debts:     debts,
		CreatedAt: output.Event.CreatedAt(),
		UpdatedAt: output.Event.UpdatedAt(),
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
	Event   *domain.LendingEvent
	Debtors []*domain.Debtor
}

type GetInput struct {
	UserID  uuid.UUID
	EventID ulid.ULID
}

type GetOutput struct {
	Event   *domain.LendingEvent
	Debtors []*domain.Debtor
}
