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
	HandleUpdate(c echo.Context) error
}

type userHandler struct {
	useCase usecase.UserUseCase
}

// HandleGetByUidWithPahtParam implements UserHandler.
func (u *userHandler) HandleGetByUidWithPahtParam(c echo.Context) error {
	res := new(response.User)
	errResponse := new(response.Error)
	uid := c.Param("uid")

	user, err := u.useCase.GetUserByUid(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.UID = user.UID
		res.Name = user.Name
		res.Email = user.Email
		res.PhotoUrl = user.PhotoUrl
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetByEmail implements UserHandler.
func (u *userHandler) HandleGetByEmail(c echo.Context) error {
	req := new(request.GetUserByEmailRequest)
	errRes := new(response.Error)

	if err := c.Bind(req); err != nil {
		log.Print("failed json bind")
		errRes.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errRes)
	}

	users, err := u.useCase.GetUsersByEmail(c.Request().Context(), req.Email)
	if err != nil {
		errRes.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRes)
	} else {

		return c.JSON(http.StatusOK, users)
	}
}

// HandleGetByUid implements UserHandler.
func (u *userHandler) HandleGetByUid(c echo.Context) error {
	res := new(response.User)
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	user, err := u.useCase.GetUserByUid(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.UID = user.UID
		res.Name = user.Name
		res.Email = user.Email
		res.PhotoUrl = user.PhotoUrl
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
	res := new(response.User)
	errRes := new(response.Error)
	uid := c.Get("uid").(string)

	if err := c.Bind(req); err != nil {
		log.Print("failed json bind")
		errRes.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errRes)
	}

	user, err := u.useCase.UpdateUser(c.Request().Context(), uid, req.Name, req.Url)
	if err != nil {
		errRes.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRes)
	} else {
		res.UID = user.UID
		res.Name = user.Name
		res.Email = user.Email
		res.PhotoUrl = user.PhotoUrl
		return c.JSON(http.StatusOK, res)
	}
}

func NewUserHandler(userUseCase usecase.UserUseCase) UserHandler {
	return &userHandler{
		useCase: userUseCase,
	}
}
