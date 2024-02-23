package handler

import (
	"log"
	"net/http"

	"github.com/datti-api/pkg/interface/request"
	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
)

type BankAccountHandler interface {
	HandleUpsert(c echo.Context) error
	HandleGet(c echo.Context) error
	HandleDelete(c echo.Context) error
}

type bankAccountHandler struct {
	useCase usecase.BankAccountUseCase
}

// HandleCreate implements BankAccountHandler.
func (bh *bankAccountHandler) HandleUpsert(c echo.Context) error {
	req := new(request.BankAccountPostRequest)
	errRespons := new(response.Error)
	uid := c.Get("uid").(string)

	if err := c.Bind(&req); err != nil {
		log.Print("failed json bind")
		errRespons.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errRespons)
	}

	newBankAccount, err := bh.useCase.UpsertBankAccount(c.Request().Context(), uid, req.AccountCode, req.BankCode, req.BranchCode)
	if err != nil {
		errRespons.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRespons)
	} else {
		return c.JSON(http.StatusCreated, newBankAccount)
	}
}

// HandleGet implements BankAccountHandler.
func (bh *bankAccountHandler) HandleGet(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	findBankAccount, err := bh.useCase.GetBankAccountById(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, findBankAccount)
	}
}

// HandleUpdate implements BankAccountHandler.
func (bh *bankAccountHandler) HandleDelete(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	_, err := bh.useCase.DeleteBankAccount(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, struct {
			Message string `json:"message"`
		}{
			Message: "delete successfully",
		})
	}
}

func NewBankAccountHandler(bankAccountUseCase usecase.BankAccountUseCase) BankAccountHandler {
	return &bankAccountHandler{
		useCase: bankAccountUseCase,
	}
}
