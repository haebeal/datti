package handler

import (
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
)

type GroupHandler interface {
	HandleCreate(c echo.Context) error
	HandleGetById(c echo.Context) error
	HandleGet(c echo.Context) error
	HandleUpdate(c echo.Context) error
}

type groupHandler struct {
	useCase usecase.GroupUseCase
}

func NewGroupHandler(groupUseCase usecase.GroupUseCase) GroupHandler {
	return &groupHandler{
		useCase: groupUseCase,
	}
}

// HandleCreate implements GroupHandler.
func (*groupHandler) HandleCreate(c echo.Context) error {
	panic("unimplemented")
}

// HandleGet implements GroupHandler.
func (*groupHandler) HandleGet(c echo.Context) error {
	panic("unimplemented")
}

// HandleGetById implements GroupHandler.
func (*groupHandler) HandleGetById(c echo.Context) error {
	panic("unimplemented")
}

// HandleUpdate implements GroupHandler.
func (*groupHandler) HandleUpdate(c echo.Context) error {
	panic("unimplemented")
}
