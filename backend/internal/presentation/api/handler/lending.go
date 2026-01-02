package handler

import (
	"context"
	"fmt"
	"net/http"
	"time"

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
	Delete(context.Context, DeleteInput) error
}

type lendingHandler struct {
	u LendingUseCase
}

func NewLendingHandler(u LendingUseCase) lendingHandler {
	return lendingHandler{
		u: u,
	}
}

func (h lendingHandler) Create(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.Create")
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

	var req api.LendingCreateRequest

	err = c.Bind(&req)
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
		debtParams = append(debtParams, DebtParam{
			UserID: d.UserId,
			Amount: int64(d.Amount),
		})
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

	input := CreateInput{
		GroupID:   groupID,
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
		if err.Error() == "forbidden Error" {
			return c.JSON(http.StatusForbidden, res)
		}
		if err.Error() == "BadRequest Error" {
			return c.JSON(http.StatusBadRequest, res)
		}
		if err.Error() == "自分自身に立て替えを作成することはできません" {
			return c.JSON(http.StatusBadRequest, res)
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	var debts []api.LendingDebtParmam
	for _, d := range output.Debtors {
		debts = append(debts, api.LendingDebtParmam{
			UserId: d.ID(),
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

func (h lendingHandler) Get(c echo.Context, id string, lendingId string) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.Get")
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

	eventID, err := ulid.Parse(lendingId)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", lendingId)
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

	input := GetInput{
		GroupID: groupID,
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
		if err.Error() == "forbidden Error" {
			return c.JSON(http.StatusForbidden, res)
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	var debts []api.LendingDebtParmam
	for _, d := range output.Debtors {
		debts = append(debts, api.LendingDebtParmam{
			UserId: d.ID(),
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

func (h lendingHandler) GetAll(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.GetAll")
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
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := GetAllInput{
		GroupID: groupID,
		UserID:  userID,
	}

	output, err := h.u.GetAll(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get lending events: %v", err)
		res := &api.ErrorResponse{
			Message: message,
		}
		if err.Error() == "forbidden Error" {
			return c.JSON(http.StatusForbidden, res)
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	responseItems := make([]api.LendingGetAllResponse, 0)
	for _, l := range output.Lendings {
		var debts []api.LendingDebtParmam
		for _, d := range l.Debtors {
			debts = append(debts, api.LendingDebtParmam{
				UserId: d.ID(),
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

func (h lendingHandler) Update(c echo.Context, id string, lendingId string) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.Update")
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

	eventID, err := ulid.Parse(lendingId)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", lendingId)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var debtParams []DebtParam
	for _, d := range req.Debts {
		debtParams = append(debtParams, DebtParam{
			UserID: d.UserId,
			Amount: int64(d.Amount),
		})
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

	input := UpdateInput{
		GroupID:   groupID,
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
		if err.Error() == "forbidden Error" {
			return c.JSON(http.StatusForbidden, res)
		}
		if err.Error() == "BadRequest Error" {
			return c.JSON(http.StatusBadRequest, res)
		}
		if err.Error() == "自分自身に立て替えを作成することはできません" {
			return c.JSON(http.StatusBadRequest, res)
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	var debts []api.LendingDebtParmam
	for _, d := range output.Debtors {
		debts = append(debts, api.LendingDebtParmam{
			UserId: d.ID(),
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

func (h lendingHandler) Delete(c echo.Context, id string, lendingId string) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.Delete")
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

	eventID, err := ulid.Parse(lendingId)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", lendingId)
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

	input := DeleteInput{
		GroupID: groupID,
		UserID:  userID,
		EventID: eventID,
	}

	err = h.u.Delete(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to delete lending event: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)

		// 権限エラーの場合は403を返す
		if err.Error() == "forbidden Error" {
			res := &api.ErrorResponse{
				Message: message,
			}
			return c.JSON(http.StatusForbidden, res)
		}

		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	return c.NoContent(http.StatusNoContent)
}

type CreateInput struct {
	GroupID   ulid.ULID
	UserID    string
	Name      string
	Amount    int64
	Debts     []DebtParam
	EventDate time.Time
}
type DebtParam struct {
	UserID string
	Amount int64
}

type CreateOutput struct {
	Event   *domain.Lending
	Debtors []*domain.Debtor
}

type GetInput struct {
	GroupID ulid.ULID
	UserID  string
	EventID ulid.ULID
}

type GetOutput struct {
	Lending *domain.Lending
	Debtors []*domain.Debtor
}

type GetAllInput struct {
	GroupID ulid.ULID
	UserID  string
}

type GetAllOutput struct {
	Lendings []struct {
		Lending *domain.Lending
		Debtors []*domain.Debtor
	}
}

type UpdateInput struct {
	GroupID   ulid.ULID
	UserID    string
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

type DeleteInput struct {
	GroupID ulid.ULID
	UserID  string
	EventID ulid.ULID
}
