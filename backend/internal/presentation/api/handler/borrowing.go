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
	GetAll(context.Context, GetAllBorrowingInput) (*GetAllBorrowingOutput, error)
}

type borrowingHandler struct {
	u BorrowingUseCase
}

func NewBorrowingHandler(u BorrowingUseCase) borrowingHandler {
	return borrowingHandler{
		u: u,
	}
}

func (b borrowingHandler) GetAll(c echo.Context, id string) error {
	ctx, span := tracer.Start(c.Request().Context(), "borrowing.GetAll")
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

	input := GetAllBorrowingInput{
		UserID:  userID,
		GroupID: groupID,
	}

	output, err := b.u.GetAll(ctx, input)
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

	res := []api.BorrowingGetAllResponse{}
	for _, borrowing := range output.Borrowings {
		res = append(res, api.BorrowingGetAllResponse{
			Id:        borrowing.ID().String(),
			Name:      borrowing.Name(),
			Amount:    uint64(borrowing.Amount().Value()),
			EventDate: borrowing.EventDate(),
			CreatedAt: borrowing.CreatedAt(),
			UpdatedAt: borrowing.UpdatedAt(),
		})
	}

	return c.JSON(http.StatusOK, res)
}

type GetAllBorrowingInput struct {
	UserID  string
	GroupID ulid.ULID
}

type GetAllBorrowingOutput struct {
	Borrowings []*domain.Borrowing
}
