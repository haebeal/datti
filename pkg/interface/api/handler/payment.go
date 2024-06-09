package handler

import (
	"net/http"

	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
)

type PaymentHandler interface {
	HandleGet(c echo.Context) error
	HandleGetById(c echo.Context) error
	HandleCreate(c echo.Context) error
	HandleUpdate(c echo.Context) error
	HandleDelete(c echo.Context) error
}

type paymentHandler struct {
	useCase usecase.PaymentUseCase
}

// HandleCreate implements PaymentHandler.
func (p *paymentHandler) HandleCreate(c echo.Context) error {
	panic("unimplemented")
}

// HandleDelete implements PaymentHandler.
func (p *paymentHandler) HandleDelete(c echo.Context) error {
	panic("unimplemented")
}

// HandleGet implements PaymentHandler.
func (p *paymentHandler) HandleGet(c echo.Context) error {
	userId := c.Get("uid").(string)
	res := &response.Payments{
		Payments: make([]struct {
			User struct {
				ID       string "json:\"uid\""
				Name     string "json:\"name\""
				Email    string "json:\"email\""
				PhotoUrl string "json:\"photoUrl\""
			} "json:\"user\""
			Balance int "json:\"amount\""
		}, 0),
	}

	payments, err := p.useCase.GetPayments(c.Request().Context(), userId)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	} else {
		for _, payment := range payments.Payments {
			res.Payments = append(res.Payments, struct {
				User struct {
					ID       string `json:"uid"`
					Name     string `json:"name"`
					Email    string `json:"email"`
					PhotoUrl string `json:"photoUrl"`
				} `json:"user"`
				Balance int `json:"amount"`
			}{
				// ここにレスポンスを詰めろじゃないとお前を詰める
				User: struct {
					ID       string `json:"uid"`
					Name     string `json:"name"`
					Email    string `json:"email"`
					PhotoUrl string `json:"photoUrl"`
				}{
					ID:       payment.User.ID,
					Name:     payment.User.Name,
					Email:    payment.User.Email,
					PhotoUrl: payment.User.PhotoUrl,
				},
				Balance: payment.Balance,
			})
		}
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetById implements PaymentHandler.
func (p *paymentHandler) HandleGetById(c echo.Context) error {
	panic("unimplemented")
}

// HandleUpdate implements PaymentHandler.
func (p *paymentHandler) HandleUpdate(c echo.Context) error {
	panic("unimplemented")
}

func NewPaymentHandler(paymentUseCase usecase.PaymentUseCase) PaymentHandler {
	return &paymentHandler{
		useCase: paymentUseCase,
	}
}
