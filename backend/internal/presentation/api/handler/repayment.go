package handler

import (
	"context"
	"errors"
	"net/http"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"go.opentelemetry.io/otel/codes"
)

type RepaymentUseCase interface {
	Create(context.Context, RepaymentCreateInput) (*RepaymentCreateOutput, error)
	GetByQuery(context.Context, RepaymentGetByQueryInput) (*RepaymentGetByQueryOutput, error)
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
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	payerID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := RepaymentCreateInput{
		PayerID:  payerID,
		DebtorID: req.DebtorId,
		Amount:   int64(req.Amount),
	}

	output, err := h.u.Create(ctx, input)
	if err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "ユーザーが見つかりません",
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

	res := &api.RepaymentCreateResponse{
		Id:        output.Repayment.ID().String(),
		PayerId:   output.Repayment.PayerID(),
		DebtorId:  output.Repayment.DebtorID(),
		Amount:    uint64(output.Repayment.Amount()),
		CreatedAt: output.Repayment.CreatedAt(),
		UpdatedAt: output.Repayment.UpdatedAt(),
	}

	return c.JSON(http.StatusCreated, res)
}

func (h repaymentHandler) GetByQuery(c echo.Context, params api.RepaymentGetAllParams) error {
	ctx, span := tracer.Start(c.Request().Context(), "repayment.GetByQuery")
	defer span.End()

	userID, ok := c.Get("uid").(string)
	if !ok {
		res := &api.ErrorResponse{
			Message: "認証情報が取得できませんでした",
		}
		return c.JSON(http.StatusUnauthorized, res)
	}

	// Default limit
	limit := int32(20)
	if params.Limit != nil {
		limit = *params.Limit
	}

	input := RepaymentGetByQueryInput{
		UserID: userID,
		Limit:  limit,
		Cursor: params.Cursor,
	}

	output, err := h.u.GetByQuery(ctx, input)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: "サーバーエラーが発生しました",
		}
		return c.JSON(http.StatusInternalServerError, res)
	}

	responseItems := make([]api.RepaymentGetAllResponse, 0, len(output.Repayments))
	for _, r := range output.Repayments {
		responseItems = append(responseItems, api.RepaymentGetAllResponse{
			Id:        r.ID().String(),
			PayerId:   r.PayerID(),
			DebtorId:  r.DebtorID(),
			Amount:    uint64(r.Amount()),
			CreatedAt: r.CreatedAt(),
			UpdatedAt: r.UpdatedAt(),
		})
	}

	res := api.RepaymentPaginatedResponse{
		Repayments: responseItems,
		NextCursor: output.NextCursor,
		HasMore:    output.HasMore,
	}

	return c.JSON(http.StatusOK, res)
}

func (h repaymentHandler) Get(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "repayment.Get")
	defer span.End()

	input := RepaymentGetInput{
		ID: id,
	}

	output, err := h.u.Get(ctx, input)
	if err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "返済が見つかりません",
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

	res := &api.RepaymentGetResponse{
		Id:        output.Repayment.ID().String(),
		PayerId:   output.Repayment.PayerID(),
		DebtorId:  output.Repayment.DebtorID(),
		Amount:    uint64(output.Repayment.Amount()),
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
		res := &api.ErrorResponse{
			Message: "リクエストの形式が正しくありません",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	input := RepaymentUpdateInput{
		ID:     id,
		Amount: int64(req.Amount),
	}

	output, err := h.u.Update(ctx, input)
	if err != nil {
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "返済が見つかりません",
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

	res := &api.RepaymentUpdateResponse{
		Id:        output.Repayment.ID().String(),
		PayerId:   output.Repayment.PayerID(),
		DebtorId:  output.Repayment.DebtorID(),
		Amount:    uint64(output.Repayment.Amount()),
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
		
		if errors.Is(err, &domain.NotFoundError{}) {
			res := &api.ErrorResponse{
				Message: "返済が見つかりません",
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

type RepaymentCreateInput struct {
	PayerID  string
	DebtorID string
	Amount   int64
}

type RepaymentCreateOutput struct {
	Repayment *domain.Repayment
}

type RepaymentGetByQueryInput struct {
	UserID string
	Limit  int32
	Cursor *string
}

type RepaymentGetByQueryOutput struct {
	Repayments []*domain.Repayment
	NextCursor *string
	HasMore    bool
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
