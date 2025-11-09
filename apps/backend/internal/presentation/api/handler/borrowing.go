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

func (b borrowingHandler) GetAll(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "borrowing.GetAll")
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

	input := GetAllBorrowingInput{
		UserID: userID,
	}

	output, err := b.u.GetAll(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to get borrowing event: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{
			Message: message,
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
	UserID uuid.UUID
}

type GetAllBorrowingOutput struct {
	Borrowings []*domain.Borrowing
}
