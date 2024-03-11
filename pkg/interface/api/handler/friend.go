package handler

import (
	"net/http"

	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
)

type FriendHandler interface {
	HandleGetFriends(c echo.Context) error
	HandleGetApplyings(c echo.Context) error
	HandleGetApplieds(c echo.Context) error
	HandlerRequest(c echo.Context) error
	HandleDelete(c echo.Context) error
}

type friendHandler struct {
	useCase usecase.FriendUseCase
}

// HandlerRequest implements FriendHandler.
func (f *friendHandler) HandlerRequest(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)
	fuid := c.Param("uid")

	err := f.useCase.SendFriendRequest(c.Request().Context(), uid, fuid)
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
func (f *friendHandler) HandleDelete(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)
	fuid := c.Param("uid")

	err := f.useCase.DeleteFriend(c.Request().Context(), uid, fuid)
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

// HandleGetApplieds implements FriendHandler.
func (f *friendHandler) HandleGetApplieds(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	applides, err := f.useCase.GetApplieds(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, applides)
	}
}

// HandleGetApplyings implements FriendHandler.
func (f *friendHandler) HandleGetApplyings(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	applyings, err := f.useCase.GetApplyings(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, applyings)
	}
}

// HandleGetFriends implements FriendHandler.
func (f *friendHandler) HandleGetFriends(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	friends, err := f.useCase.GetFriends(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, friends)
	}
}

func NewFriendHandler(useCase usecase.FriendUseCase) FriendHandler {
	return &friendHandler{
		useCase: useCase,
	}

}
