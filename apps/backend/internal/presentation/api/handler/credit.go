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

// CreditUseCase exposes read operations for credit summaries.
type CreditUseCase interface {
	List(ctx context.Context, input CreditListInput) (*CreditListOutput, error)
}

// CreditListInput carries parameters for listing credits from the perspective of the authenticated user.
type CreditListInput struct {
	UserID uuid.UUID
}

// CreditListOutput aggregates lending and borrowing credits for the caller.
type CreditListOutput struct {
	Lendings   []*domain.Credit
	Borrowings []*domain.Credit
}

type creditHandler struct {
	u CreditUseCase
}

func NewCreditHandler(u CreditUseCase) creditHandler {
	return creditHandler{
		u: u,
	}
}

func (h creditHandler) List(c echo.Context) error {
	ctx, span := tracer.Start(c.Request().Context(), "credit.List")
	defer span.End()

	userID, ok := c.Get("uid").(uuid.UUID)
	if !ok {
		message := "Failed to get authorized userID"
		span.SetStatus(codes.Error, message)
		res := &api.ErrorResponse{Message: message}
		return c.JSON(http.StatusUnauthorized, res)
	}

	input := CreditListInput{UserID: userID}
	output, err := h.u.List(ctx, input)
	if err != nil {
		message := fmt.Sprintf("Failed to list credits: %v", err)
		span.SetStatus(codes.Error, message)
		span.RecordError(err)
		res := &api.ErrorResponse{Message: message}
		return c.JSON(http.StatusInternalServerError, res)
	}

	balances := make(map[string]int64, len(output.Lendings)+len(output.Borrowings))
	for _, credit := range output.Lendings {
		userID := credit.UserID().String()
		balances[userID] += credit.Amount().Value()
	}
	for _, credit := range output.Borrowings {
		userID := credit.UserID().String()
		balances[userID] -= credit.Amount().Value()
	}

	summaries := make([]api.CreditSummary, 0, len(balances))
	for userID, amount := range balances {
		if amount == 0 {
			continue
		}
		summaries = append(summaries, api.CreditSummary{
			UserId: userID,
			Amount: amount,
		})
	}

	return c.JSON(http.StatusOK, summaries)
}
