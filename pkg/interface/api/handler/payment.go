package handler

import (
	"net/http"
	"time"

	"github.com/datti-api/pkg/interface/request"
	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
	"github.com/datti-api/pkg/usecase/dto"
	"github.com/labstack/echo/v4"
)

type PaymentHandler interface {
	HandleGet(c echo.Context) error
	HandleGetById(c echo.Context) error
	HandleCreate(c echo.Context) error
	HandleUpdate(c echo.Context) error
	HandleHistory(c echo.Context) error
	HandleDelete(c echo.Context) error
}

type paymentHandler struct {
	useCase usecase.PaymentUseCase
}

// HandleCreate implements PaymentHandler.
func (p *paymentHandler) HandleCreate(c echo.Context) error {
	userId := c.Get("uid").(string)
	req := &request.Create{}
	res := &response.Payment{}
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	paymentCreate := &dto.PaymentCreate{
		PaidAt: req.PaidAt,
		PaidTo: req.PaidTo,
		PaidBy: userId,
		Amount: req.Amount,
	}

	payment, paidBy, paidTo, err := p.useCase.CreatePayment(c.Request().Context(), paymentCreate)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	} else {
		res.ID = payment.ID
		res.PaidTo = *paidTo
		res.PaidBy = *paidBy
		res.Amount = payment.Amount
		return c.JSON(http.StatusOK, res)
	}
}

// HandleDelete implements PaymentHandler.
func (p *paymentHandler) HandleDelete(c echo.Context) error {
	payID := c.Param("payId")
	err := p.useCase.DeletePayment(c.Request().Context(), payID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	} else {
		return c.JSON(http.StatusOK, struct {
			Message string `json:"message"`
		}{
			Message: "delete successfully",
		})
	}
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
	payID := c.Param("payId")
	res := &response.Payment{}

	payment, paidBy, paidTo, err := p.useCase.GetPayment(c.Request().Context(), payID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	} else {
		res.ID = payment.ID
		res.PaidTo = *paidTo
		res.PaidBy = *paidBy
		res.Amount = payment.Amount
		return c.JSON(http.StatusOK, res)
	}

}

// HandleUpdate implements PaymentHandler.
func (p *paymentHandler) HandleUpdate(c echo.Context) error {
	payID := c.Param("payId")
	req := &request.Update{}
	res := &response.Payment{}
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	payment, paidBy, paidTo, err := p.useCase.UpdatePayment(c.Request().Context(), payID, req.PaidBy, req.PaidTo, req.PaidAt, req.Amount)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	} else {
		res.ID = payment.ID
		res.PaidTo = *paidTo
		res.PaidBy = *paidBy
		res.Amount = payment.Amount
		return c.JSON(http.StatusOK, res)
	}
}

func (p *paymentHandler) HandleHistory(c echo.Context) error {
	userID := c.Get("uid").(string)
	res := &response.PaymentList{}

	payments, paidByUsers, paidToUsers, err := p.useCase.GetHistory(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	} else {
		for i, payment := range payments {
			res.Paymetns = append(res.Paymetns, struct {
				ID     string    `json:"id"`
				PaidAt time.Time `json:"paid_at"`
				PaidBy struct {
					ID       string `json:"uid"`
					Name     string `json:"name"`
					Email    string `json:"email"`
					PhotoUrl string `json:"photoUrl"`
				} `json:"paid_by"`
				PaidTo struct {
					ID       string `json:"uid"`
					Name     string `json:"name"`
					Email    string `json:"email"`
					PhotoUrl string `json:"photoUrl"`
				} `json:"paid_to"`
				Amount int `json:"amount"`
			}{
				ID:     payment.ID,
				PaidAt: payment.PaidAt,
				PaidBy: struct {
					ID       string `json:"uid"`
					Name     string `json:"name"`
					Email    string `json:"email"`
					PhotoUrl string `json:"photoUrl"`
				}{
					ID:       paidByUsers[i].ID,
					Name:     paidByUsers[i].Name,
					Email:    paidByUsers[i].Email,
					PhotoUrl: paidByUsers[i].PhotoUrl,
				},
				PaidTo: struct {
					ID       string `json:"uid"`
					Name     string `json:"name"`
					Email    string `json:"email"`
					PhotoUrl string `json:"photoUrl"`
				}{
					ID:       paidToUsers[i].ID,
					Name:     paidToUsers[i].Name,
					Email:    paidToUsers[i].Email,
					PhotoUrl: paidToUsers[i].PhotoUrl,
				},
				Amount: payment.Amount,
			})
		}
		return c.JSON(http.StatusOK, res)
	}
}

func NewPaymentHandler(paymentUseCase usecase.PaymentUseCase) PaymentHandler {
	return &paymentHandler{
		useCase: paymentUseCase,
	}
}
