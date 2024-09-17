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
	HandlerFriendRequest(c echo.Context) error
	HandleDeleteFriend(c echo.Context) error
}

type userHandler struct {
	useCase usecase.UserUseCase
}

// HandleGetByUidWithPahtParam implements UserHandler.
func (u *userHandler) HandleGetByUidWithPahtParam(c echo.Context) error {
	res := new(response.User)
	errResponse := new(response.Error)
	userID := c.Get("uid").(string)
	targetID := c.Param("userId")

	user, status, err := u.useCase.GetUserByUid(c.Request().Context(), userID, targetID)
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
	userID := c.Get("uid").(string)
	email := c.QueryParam("email")
	status := c.QueryParam("status")
	errRes := new(response.Error)

	users, err := u.useCase.GetUsersByEmail(c.Request().Context(), userID, email, status)
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
			res[i].Status = users[i].Status
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
	userID := c.Get("uid").(string)

	user, status, err := u.useCase.GetUserByUid(c.Request().Context(), userID, userID)
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
	userID := c.Get("uid").(string)

	user, err := u.useCase.GetUsers(c.Request().Context(), userID)
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
	userID := c.Get("uid").(string)

	if err := c.Bind(req); err != nil {
		log.Print("failed json bind")
		errRes.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errRes)
	}

	user, err := u.useCase.UpdateUser(c.Request().Context(), userID, req.Name, req.Url)
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

// HandlerRequest implements FriendHandler.
func (u *userHandler) HandlerFriendRequest(c echo.Context) error {
	errResponse := new(response.Error)
	userID := c.Get("uid").(string)
	friendUserID := c.Param("userId")

	err := u.useCase.SendFriendRequest(c.Request().Context(), userID, friendUserID)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, struct {
			Message string `json:"message"`
		}{
			Message: "requested successfully",
		})
	}
}

// HandleDelete implements FriendHandler.
func (u *userHandler) HandleDeleteFriend(c echo.Context) error {
	errResponse := new(response.Error)
	userID := c.Get("uid").(string)
	friendUserID := c.Param("userId")

	err := u.useCase.DeleteFriend(c.Request().Context(), userID, friendUserID)
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

func NewUserHandler(userUseCase usecase.UserUseCase) UserHandler {
	return &userHandler{
		useCase: userUseCase,
	}
}
