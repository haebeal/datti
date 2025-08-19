package api

import (
	"net/http"

	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/usecase"
	"github.com/labstack/echo/v4"
)

type PaymentHandler struct {
	pu usecase.PaymentUseCase
}

func NewPaymentHandler(pu usecase.PaymentUseCase) *PaymentHandler {
	return &PaymentHandler{
		pu: pu,
	}
}

func (ph *PaymentHandler) Create(c echo.Context) error {

	req := new(api.PaymentCreateEventRequest)
	err := c.Bind(req)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "bad request",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var payments []struct {
		userID string
		amount int64
	}
	// Convert req.Debtors to the expected type
	debtors := make([]*struct {
		userID string
		amount int64
	}, len(req.Debtors))
	for i, d := range req.Debtors {
		debtors[i] = &struct {
			userID string
			amount int64
		}{
			userID: d.Id,
			amount: int64(d.Amount),
		}
	}

	payment, err := ph.pu.Create(req.Name, int64(req.Payer.Amount), req.Payer.Id, req.EventDate, debtors)

	res := &api.PaymentCreateEventResponse{
		CreatedAt: payment.CreatedAt(),
		// Debtors:
		EventDate: payment.EventDate(),
		Id:        payment.ID().String(),
		Name:      payment.Name(),
		Payer: struct {
			Amount uint64 "json:\"amount\""
			Avatar string "json:\"avatar\""
			Email  string "json:\"email\""
			Id     string "json:\"id\""
			Name   string "json:\"name\""
		}{
			Amount: uint64(payment.Payer().Amount().Value()),
			Avatar: payment.Payer().Avatar(),
			Email:  payment.Payer().Email(),
			Id:     payment.Payer().ID().String(),
			Name:   payment.Payer().Name(),
		},
		UpdatedAt: payment.UpdatedAt(),
	}

	return c.JSON(201, res)
}
