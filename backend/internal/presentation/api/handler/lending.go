package handler

import (
	"context"
	"errors"
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
	GetByQuery(context.Context, GetAllInput) (*GetAllOutput, error)
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
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var req api.LendingCreateRequest

	err = c.Bind(&req)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
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
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
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
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "立て替えが見つかりません",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		
		if errors.Is(err, &domain.ForbiddenError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusForbidden, res)
		}
		
		if errors.Is(err, &domain.ValidationError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusBadRequest, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	var debts []api.LendingDebtParmam
	for _, d := range output.Debtors {
		debts = append(debts, api.LendingDebtParmam{
			UserId: d.ID(),
			Amount: uint64(d.Amount()),
		})
	}

	res := &api.LendingCreateResponse{
		Id:        output.Event.ID().String(),
		Name:      output.Event.Name(),
		Amount:    uint64(output.Event.Amount()),
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
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	eventID, err := ulid.Parse(lendingId)
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

	input := GetInput{
		GroupID: groupID,
		UserID:  userID,
		EventID: eventID,
	}

	output, err := h.u.Get(ctx, input)
	if err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "立て替えが見つかりません",
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

	var debts []api.LendingDebtParmam
	for _, d := range output.Debtors {
		debts = append(debts, api.LendingDebtParmam{
			UserId: d.ID(),
			Amount: uint64(d.Amount()),
		})
	}

	res := &api.LendingGetResponse{
		Id:        output.Lending.ID().String(),
		Name:      output.Lending.Name(),
		Amount:    uint64(output.Lending.Amount()),
		EventDate: output.Lending.EventDate(),
		Debts:     debts,
		CreatedBy: output.Lending.Payer().ID(),
		CreatedAt: output.Lending.CreatedAt(),
		UpdatedAt: output.Lending.UpdatedAt(),
	}

	return c.JSON(http.StatusOK, res)
}

func (h lendingHandler) GetByQuery(c echo.Context, id string, params api.LendingGetAllParams) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.GetByQuery")
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

	// Set default limit
	limit := int32(20)
	if params.Limit != nil {
		limit = *params.Limit
	}

	input := GetAllInput{
		GroupID: groupID,
		UserID:  userID,
		Limit:   limit,
		Cursor:  params.Cursor,
	}

	output, err := h.u.GetByQuery(ctx, input)
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

	responseItems := make([]api.LendingGetAllResponse, 0)
	for _, l := range output.Lendings {
		var debts []api.LendingDebtParmam
		for _, d := range l.Debtors {
			debts = append(debts, api.LendingDebtParmam{
				UserId: d.ID(),
				Amount: uint64(d.Amount()),
			})
		}

		responseItems = append(responseItems, api.LendingGetAllResponse{
			Id:        l.Lending.ID().String(),
			CreatedAt: l.Lending.CreatedAt(),
			Debts:     debts,
			Amount:    uint64(l.Lending.Amount()),
			Name:      l.Lending.Name(),
			EventDate: l.Lending.EventDate(),
			CreatedBy: l.Lending.Payer().ID(),
			UpdatedAt: l.Lending.UpdatedAt(),
		})
	}

	res := &api.LendingPaginatedResponse{
		Lendings:   responseItems,
		NextCursor: output.NextCursor,
		HasMore:    output.HasMore,
	}

	return c.JSON(http.StatusOK, res)
}

func (h lendingHandler) Update(c echo.Context, id string, lendingId string) error {
	ctx, span := tracer.Start(c.Request().Context(), "lending.Update")
	defer span.End()

	groupID, err := ulid.Parse(id)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var req api.LendingUpdateRequest

	if err := c.Bind(&req); err != nil {
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	eventID, err := ulid.Parse(lendingId)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
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
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
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
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "立て替えが見つかりません",
			}
			return c.JSON(http.StatusNotFound, res)
		}
		
		if errors.Is(err, &domain.ForbiddenError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusForbidden, res)
		}
		
		if errors.Is(err, &domain.ValidationError{}) {
			res := &api.ErrorResponse{
				Message: err.Error(),
			}
			return c.JSON(http.StatusBadRequest, res)
		}
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	var debts []api.LendingDebtParmam
	for _, d := range output.Debtors {
		debts = append(debts, api.LendingDebtParmam{
			UserId: d.ID(),
			Amount: uint64(d.Amount()),
		})
	}

	res := &api.LendingUpdateResponse{
		Id:        output.Lending.ID().String(),
		Name:      output.Lending.Name(),
		Amount:    uint64(output.Lending.Amount()),
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
		res := &api.ErrorResponse{
			Message: "IDの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	eventID, err := ulid.Parse(lendingId)
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

	input := DeleteInput{
		GroupID: groupID,
		UserID:  userID,
		EventID: eventID,
	}

	err = h.u.Delete(ctx, input)
	if err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "立て替えが見つかりません",
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
	Limit   int32
	Cursor  *string
}

type GetAllOutput struct {
	Lendings []struct {
		Lending *domain.Lending
		Debtors []*domain.Debtor
	}
	NextCursor *string
	HasMore    bool
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
