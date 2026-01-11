package handler

import (
	"context"
	"fmt"
	"net/http"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type BorrowingUseCase interface {
	Get(context.Context, GetBorrowingInput) (*GetBorrowingOutput, error)
	GetByQuery(context.Context, GetAllBorrowingInput) (*GetAllBorrowingOutput, error)
}

type borrowingHandler struct {
	u BorrowingUseCase
}

func NewBorrowingHandler(u BorrowingUseCase) borrowingHandler {
	return borrowingHandler{
		u: u,
	}
}

func (b borrowingHandler) Get(c echo.Context, id string, borrowingId string) error {
	ctx, span := tracer.Start(c.Request().Context(), "borrowing.Get")
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

	eventID, err := ulid.Parse(borrowingId)
	if err != nil {
		message := fmt.Sprintf("Failed to parse ulid: %v", borrowingId)
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

	input := GetBorrowingInput{
		UserID:  userID,
		GroupID: groupID,
		EventID: eventID,
	}

	output, err := b.u.Get(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get borrowing event: %v", err)
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

	res := &api.BorrowingGetResponse{
		Id:        output.Borrowing.ID().String(),
		Name:      output.Borrowing.Name(),
		Amount:    uint64(output.Borrowing.Amount().Value()),
		EventDate: output.Borrowing.EventDate(),
		CreatedAt: output.Borrowing.CreatedAt(),
		UpdatedAt: output.Borrowing.UpdatedAt(),
	}

	return c.JSON(http.StatusOK, res)
}

func (b borrowingHandler) GetByQuery(c echo.Context, id string, params api.BorrowingGetAllParams) error {
	ctx, span := tracer.Start(c.Request().Context(), "borrowing.GetByQuery")
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

	// Set default limit
	limit := int32(20)
	if params.Limit != nil {
		limit = *params.Limit
	}

	input := GetAllBorrowingInput{
		UserID:  userID,
		GroupID: groupID,
		Limit:   limit,
		Cursor:  params.Cursor,
	}

	output, err := b.u.GetByQuery(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get borrowing event: %v", err)
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

	responseItems := make([]api.BorrowingGetAllResponse, 0)
	for _, borrowing := range output.Borrowings {
		responseItems = append(responseItems, api.BorrowingGetAllResponse{
			Id:        borrowing.ID().String(),
			Name:      borrowing.Name(),
			Amount:    uint64(borrowing.Amount().Value()),
			EventDate: borrowing.EventDate(),
			CreatedAt: borrowing.CreatedAt(),
			UpdatedAt: borrowing.UpdatedAt(),
		})
	}

	res := &api.BorrowingPaginatedResponse{
		Borrowings: responseItems,
		NextCursor: output.NextCursor,
		HasMore:    output.HasMore,
	}

	return c.JSON(http.StatusOK, res)
}

type GetAllBorrowingInput struct {
	UserID  string
	GroupID ulid.ULID
	Limit   int32
	Cursor  *string
}

type GetAllBorrowingOutput struct {
	Borrowings []*domain.Borrowing
	NextCursor *string
	HasMore    bool
}

type GetBorrowingInput struct {
	UserID  string
	GroupID ulid.ULID
	EventID ulid.ULID
}

type GetBorrowingOutput struct {
	Borrowing *domain.Borrowing
}
