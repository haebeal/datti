package handler

import (
	"errors"
	"log"
	"net/http"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
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
	uid := c.Get("uid").(string)
	errRespons := new(response.Error)

	bankAccount := new(model.BankAccount)
	if err := c.Bind(&bankAccount); err != nil {
		log.Print("failed json bind")
		errRespons.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errRespons)
	}

	bankAccount.UserID = uid
	newBankAccount, err := bh.useCase.UpsertBankAccount(c.Request().Context(), bankAccount)
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

	user := new(model.User)
	user.ID = uid

	findBankAccount, err := bh.useCase.GetBankAccountById(c.Request().Context(), user)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			errResponse.Error = err.Error()
			return c.JSON(http.StatusNotFound, errResponse)
		} else {
			errResponse.Error = err.Error()
			return c.JSON(http.StatusInternalServerError, errResponse)
		}
	} else {
		return c.JSON(http.StatusOK, findBankAccount)
	}
}

// HandleUpdate implements BankAccountHandler.
func (bh *bankAccountHandler) HandleDelete(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	user := new(model.User)
	user.ID = uid

	err := bh.useCase.DeleteBankAccount(c.Request().Context(), user)
	errResponse.Error = err.Error()
	if err != nil {
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
