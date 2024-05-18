package handler

import (
	"log"
	"net/http"

	"github.com/datti-api/pkg/interface/request"
	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
)

type UserHandler interface {
	HandleGetUsers(c echo.Context) error
	HandleGetByUid(c echo.Context) error
	HandleGetByUidWithPahtParam(c echo.Context) error
	HandleGetByEmail(c echo.Context) error
	HandleGetStatus(c echo.Context) error
	HandleUpdate(c echo.Context) error
}

type userHandler struct {
	useCase usecase.UserUseCase
}

// HandleGetStatus implements UserHandler.
func (u *userHandler) HandleGetStatus(c echo.Context) error {
	res := new(response.UserStatus)
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)
	fuid := c.Param("userId")

	user, status, err := u.useCase.GetUserStatus(c.Request().Context(), uid, fuid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.UID = user.UID
		res.Name = user.Name
		res.Status = status
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetByUidWithPahtParam implements UserHandler.
func (u *userHandler) HandleGetByUidWithPahtParam(c echo.Context) error {
	res := new(response.UserWithBankAccount)
	errResponse := new(response.Error)
	uid := c.Param("uid")

	user, bank, err := u.useCase.GetUserByUid(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.UID = user.UID
		res.Name = user.Name
		res.Email = user.Email
		res.PhotoUrl = user.PhotoUrl
		res.Bank.BankCode = bank.BankCode
		res.Bank.BranchCode = bank.BranchCode
		res.Bank.AccountCode = bank.AccountCode
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetByEmail implements UserHandler.
func (u *userHandler) HandleGetByEmail(c echo.Context) error {
	email := c.QueryParam("email")
	errRes := new(response.Error)

	users, banks, err := u.useCase.GetUsersByEmail(c.Request().Context(), email)
	if err != nil {
		errRes.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRes)
	} else {
		res := make([]response.UserWithBankAccount, len(users))
		for i := 0; i < len(res); i++ {
			res[i].UID = users[i].UID
			res[i].Name = users[i].Name
			res[i].Email = users[i].Email
			res[i].PhotoUrl = users[i].PhotoUrl
			res[i].Bank.AccountCode = banks[i].AccountCode
			res[i].Bank.BankCode = banks[i].BankCode
			res[i].Bank.BranchCode = banks[i].BranchCode
		}
		return c.JSON(http.StatusOK, struct {
			Users []response.UserWithBankAccount `json:"users"`
		}{
			res,
		})
	}
}

// HandleGetByUid implements UserHandler.
func (u *userHandler) HandleGetByUid(c echo.Context) error {
	res := new(response.UserWithBankAccount)
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	user, bank, err := u.useCase.GetUserByUid(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.UID = user.UID
		res.Name = user.Name
		res.Email = user.Email
		res.PhotoUrl = user.PhotoUrl
		res.Bank.BankCode = bank.BankCode
		res.Bank.BranchCode = bank.BranchCode
		res.Bank.AccountCode = bank.AccountCode
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetUsers implements UserHandler.
func (u *userHandler) HandleGetUsers(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	user, err := u.useCase.GetUsers(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, user)
	}
}

// HandleUpdate implements UserHandler.
func (u *userHandler) HandleUpdate(c echo.Context) error {
	req := new(request.UpdateUserRequest)
	res := new(response.UserWithBankAccount)
	errRes := new(response.Error)
	uid := c.Get("uid").(string)

	if err := c.Bind(req); err != nil {
		log.Print("failed json bind")
		errRes.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errRes)
	}

	user, bank, err := u.useCase.UpdateUser(c.Request().Context(), uid, req.Name, req.Url, req.Bank.BankCode, req.Bank.BranchCode, req.Bank.AccountCode)
	if err != nil {
		errRes.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRes)
	} else {
		res.UID = user.UID
		res.Name = user.Name
		res.Email = user.Email
		res.PhotoUrl = user.PhotoUrl
		res.Bank.BankCode = bank.BankCode
		res.Bank.BranchCode = bank.BranchCode
		res.Bank.AccountCode = bank.AccountCode
		return c.JSON(http.StatusOK, res)
	}
}

func NewUserHandler(userUseCase usecase.UserUseCase) UserHandler {
	return &userHandler{
		useCase: userUseCase,
	}
}
