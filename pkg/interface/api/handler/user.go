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
	uid := c.Get("uid").(string)
	targetId := c.Param("uid")

	user, status, err := u.useCase.GetUserByUid(c.Request().Context(), uid, targetId)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.UID = user.ID
		res.Name = user.Name
		res.Email = user.Email
		res.PhotoUrl = user.PhotoUrl
		res.Status = status
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetByEmail implements UserHandler.
func (u *userHandler) HandleGetByEmail(c echo.Context) error {
	uid := c.Get("uid").(string)
	email := c.QueryParam("email")
	errRes := new(response.Error)

	users, statuses, err := u.useCase.GetUsersByEmail(c.Request().Context(), uid, email)
	if err != nil {
		errRes.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRes)
	} else {
		res := make([]response.User, len(users))
		for i := 0; i < len(res); i++ {
			res[i].UID = users[i].ID
			res[i].Name = users[i].Name
			res[i].Email = users[i].Email
			res[i].PhotoUrl = users[i].PhotoUrl
			res[i].Status = statuses[i]
		}
		return c.JSON(http.StatusOK, struct {
			Users []response.User `json:"users"`
		}{
			res,
		})
	}
}

// HandleGetByUid implements UserHandler.
func (u *userHandler) HandleGetByUid(c echo.Context) error {
	res := new(response.User)
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	user, status, err := u.useCase.GetUserByUid(c.Request().Context(), uid, uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.UID = user.ID
		res.Name = user.Name
		res.Email = user.Email
		res.PhotoUrl = user.PhotoUrl
		res.Status = status
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
		res.UID = user.ID
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
