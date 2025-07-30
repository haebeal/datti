package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/haebeal/datti/pkg/interface/request"
	"github.com/haebeal/datti/pkg/interface/response"
	"github.com/haebeal/datti/pkg/usecase"
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

	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}
	targetID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}

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
	var limit *int
	var getNext bool
	errResponse := new(response.Error)
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}
	email := c.QueryParam("email")
	status := c.QueryParam("status")
	inputCursor := c.QueryParam("cursor")
	limitStr := c.QueryParam("limit")
	limitInt, err := strconv.Atoi(limitStr)
	if err == nil {
		limit = &limitInt
	}
	getNextStr := c.QueryParam("getNext")
	getNext, err = strconv.ParseBool(getNextStr)
	if err != nil {
		getNext = true
	}
	errRes := new(response.Error)

	users, cursor, err := u.useCase.GetUsersByEmail(c.Request().Context(), userID, email, status, inputCursor, limit, getNext)
	if err != nil {
		errRes.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRes)
	} else {
		resUsers := make([]response.User, len(users))
		resCursor := response.Cursor{
			StartCursor: cursor.Start,
			EndCursor:   cursor.End,
		}
		for i := 0; i < len(resUsers); i++ {
			resUsers[i].UID = users[i].ID
			resUsers[i].Name = users[i].Name
			resUsers[i].Email = users[i].Email
			resUsers[i].PhotoUrl = users[i].PhotoUrl
			resUsers[i].Status = users[i].Status
		}
		return c.JSON(http.StatusOK, struct {
			Users  []response.User `json:"users"`
			Cursor response.Cursor `json:"cursor"`
		}{
			resUsers,
			resCursor,
		})
	}
}

// HandleGetByUid implements UserHandler.
func (u *userHandler) HandleGetByUid(c echo.Context) error {
	res := new(response.User)
	errResponse := new(response.Error)
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, err)
	}

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
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}

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
	errResponse := new(response.Error)
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}

	if err := c.Bind(req); err != nil {
		log.Print("failed json bind")
		errResponse.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errResponse)
	}

	user, err := u.useCase.UpdateUser(c.Request().Context(), userID, req.Name, req.Url)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
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
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}

	friendUserID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}

	err = u.useCase.SendFriendRequest(c.Request().Context(), userID, friendUserID)
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
	userID, err := uuid.Parse(c.Get("uid").(string))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}
	friendUserID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}

	err = u.useCase.DeleteFriend(c.Request().Context(), userID, friendUserID)
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
