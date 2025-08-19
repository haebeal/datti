package api

import (
	"net/http"

	"github.com/google/uuid"
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
	var debtors = []usecase.Debtor{}
	for _, d := range req.Debtors {
		id, err := uuid.Parse(d.Id)
		if err != nil {
			res := &api.ErrorResponse{
				Message: "bad request",
			}
			return c.JSON(http.StatusBadRequest, res)
		}
		debtors = append(debtors, usecase.Debtor{
			ID:     id,
			Amount: int64(d.Amount),
		})
	}

	id, err := uuid.Parse(req.Payer.Id)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "bad request",
		}
		return c.JSON(http.StatusBadRequest, res)
	}
	command := usecase.CreateCommand{
		Name:      req.Name,
		PayerID:   id,
		Debtors:   debtors,
		EventDate: req.EventDate,
	}
	payment, err := ph.pu.Create(command)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "internal error",
		}
		return c.JSON(http.StatusBadRequest, res)
	}
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
