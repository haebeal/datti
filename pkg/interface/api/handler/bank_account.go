package handler

import (
	"database/sql"
	"errors"
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
	res := new(response.BankAccountResponse)
	errRespons := new(response.Error)
	uid := c.Get("uid").(string)

	if err := c.Bind(&req); err != nil {
		log.Print("failed json bind")
		errRespons.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errRespons)
	}

	bankAccount, err := bh.useCase.UpsertBankAccount(c.Request().Context(), uid, req.AccountCode, req.BankCode, req.BranchCode)
	if err != nil {
		errRespons.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRespons)
	} else {
		res.UID = bankAccount.UID
		res.AccountCode = bankAccount.AccountCode
		res.BankCode = bankAccount.BankCode
		res.BranchCode = bankAccount.BranchCode
		res.CreatedAt = bankAccount.CreatedAt
		res.UpdatreAt = bankAccount.UpdatedAt
		res.DeletedAt = bankAccount.DeletedAt
		return c.JSON(http.StatusCreated, res)
	}
}

// HandleGet implements BankAccountHandler.
func (bh *bankAccountHandler) HandleGet(c echo.Context) error {
	res := new(response.BankAccountResponse)
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	bankAccount, err := bh.useCase.GetBankAccountByUid(c.Request().Context(), uid)
	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			errResponse.Error = err.Error()
			return c.JSON(http.StatusNotFound, errResponse)
		} else {
			errResponse.Error = err.Error()
			return c.JSON(http.StatusInternalServerError, errResponse)
		}
	} else {
		res.UID = bankAccount.UID
		res.AccountCode = bankAccount.AccountCode
		res.BankCode = bankAccount.BankCode
		res.BranchCode = bankAccount.BranchCode
		res.CreatedAt = bankAccount.CreatedAt
		res.UpdatreAt = bankAccount.UpdatedAt
		res.DeletedAt = bankAccount.DeletedAt
		return c.JSON(http.StatusOK, res)
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
