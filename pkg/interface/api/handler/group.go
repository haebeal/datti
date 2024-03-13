package handler

import (
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
	panic("unimplemented")
}

// HandleGetById implements GroupHandler.
func (g *groupHandler) HandleGetById(c echo.Context) error {
	panic("unimplemented")
}

// HandleRegisterd implements GroupHandler.
func (g *groupHandler) HandleRegisterd(c echo.Context) error {
	panic("unimplemented")
}

// HandleUpdate implements GroupHandler.
func (g *groupHandler) HandleUpdate(c echo.Context) error {
	panic("unimplemented")
}

func NewGroupHandler(groupUseCase usecase.GroupUseCase) GroupHandler {
	return &groupHandler{
		useCase: groupUseCase,
	}
}
