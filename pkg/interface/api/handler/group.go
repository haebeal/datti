package handler

import (
	"net/http"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/interface/response"
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
)

type GroupHandler interface {
	HandleGet(c echo.Context) error
	HandleCreate(c echo.Context) error
	HandleGetById(c echo.Context) error
	HandleUpdate(c echo.Context) error
	HandleRegisterd(c echo.Context) error
}

type groupHandler struct {
	useCase usecase.GroupUseCase
}

// HandleCreate implements GroupHandler.
func (g *groupHandler) HandleCreate(c echo.Context) error {
	panic("unimplemented")
}

// HandleGet implements GroupHandler.
func (g *groupHandler) HandleGet(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)

	groups, err := g.useCase.GetGroups(c.Request().Context(), uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, groups)
	}
}

// HandleGetById implements GroupHandler.
func (g *groupHandler) HandleGetById(c echo.Context) error {
	errResponse := new(response.Error)
	id := c.Param("id")

	group, members, err := g.useCase.GetGroupById(c.Request().Context(), id)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, struct {
			ID    string        `json:"id"`
			Name  string        `json:"name"`
			Users []*model.User `json:"users"`
		}{
			ID:    group.ID,
			Name:  group.Name,
			Users: members,
		})
	}
}

// HandleRegisterd implements GroupHandler.
func (g *groupHandler) HandleRegisterd(c echo.Context) error {
	uids := make([]string, 0)
	errResponse := new(response.Error)
	id := c.Param("id")

	group, members, err := g.useCase.RegisterdMembers(c.Request().Context(), id, uids)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, struct {
			ID    string        `json:"id"`
			Name  string        `json:"name"`
			Users []*model.User `json:"users"`
		}{
			ID:    group.ID,
			Name:  group.Name,
			Users: members,
		})
	}
}

// HandleUpdate implements GroupHandler.
func (g *groupHandler) HandleUpdate(c echo.Context) error {
	var name string
	errResponse := new(response.Error)
	id := c.Param("id")
	if err := c.Bind(&name); err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	}

	group, members, err := g.useCase.UpdateGroup(c.Request().Context(), id, name)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, struct {
			ID    string        `json:"id"`
			Name  string        `json:"name"`
			Users []*model.User `json:"users"`
		}{
			ID:    group.ID,
			Name:  group.Name,
			Users: members,
		})
	}
}

func NewGroupHandler(groupUseCase usecase.GroupUseCase) GroupHandler {
	return &groupHandler{
		useCase: groupUseCase,
	}
}
