package api

import (
	"fmt"
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
		message := fmt.Sprintf("RequestBody Bindig Error body: %v", req)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}
	var debtorParms = []usecase.DebtorParam{}
	for i, d := range req.Debtors {
		id, err := uuid.Parse(d.Id)
		if err != nil {
			message := fmt.Sprintf("Debtors UUID Parse Error ID: %v index: %v", d.Id, i)
			res := &api.ErrorResponse{
				Message: message,
			}
			return c.JSON(http.StatusBadRequest, res)
		}
		debtorParms = append(debtorParms, usecase.DebtorParam{
			ID:     id,
			Amount: int64(d.Amount),
		})
	}

	id, err := uuid.Parse(req.Payer.Id)
	if err != nil {
		message := fmt.Sprintf("Payer UUID Parse Error ID:%v", id)
		res := &api.ErrorResponse{
			Message: message,
		}
		return c.JSON(http.StatusBadRequest, res)
	}
	input := usecase.CreatePaymentInput{
		Name:      req.Name,
		PayerID:   id,
		Amount:    int64(req.Payer.Amount),
		Debtors:   debtorParms,
		EventDate: req.EventDate,
	}
	payment, err := ph.pu.Create(input)
	if err != nil {
		res := &api.ErrorResponse{
			Message: "internal error",
		}
		return c.JSON(http.StatusBadRequest, res)
	}

	var debtors []struct {
		Amount uint64 `json:"amount"`
		Avatar string `json:"avatar"`
		Email  string `json:"email"`
		Id     string `json:"id"`
		Name   string `json:"name"`
	}
	for _, d := range payment.Debtors() {
		debtor := struct {
			Amount uint64 `json:"amount"`
			Avatar string `json:"avatar"`
			Email  string `json:"email"`
			Id     string `json:"id"`
			Name   string `json:"name"`
		}{
			Id:     d.ID().String(),
			Name:   d.Name(),
			Email:  d.Email(),
			Avatar: d.Avatar(),
		}
		debtors = append(debtors, debtor)
	}

	res := &api.PaymentCreateEventResponse{
		CreatedAt: payment.CreatedAt(),
		// Debtors:
		EventDate: payment.EventDate(),
		Id:        payment.ID().String(),
		Name:      payment.Name(),
		Debtors:   debtors,
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
