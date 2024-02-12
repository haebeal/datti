package handler

import (
	"github.com/datti-api/pkg/usecase"
	"github.com/labstack/echo/v4"
)

type ProfileHandler interface {
	HandleGet(c echo.Context) error
	HandleUpdate(c echo.Context) error
}

type profileHandler struct {
	useCase usecase.ProflielUseCase
}

// HandleGet implements ProfileHandler.
func (*profileHandler) HandleGet(c echo.Context) error {
	panic("unimplemented")
}

// HandleUpdateName implements ProfileHandler.
func (*profileHandler) HandleUpdate(c echo.Context) error {
	panic("unimplemented")
}

func NewProfileHandler(profileUseCase usecase.ProflielUseCase) ProfileHandler {
	return &profileHandler{
		useCase: profileUseCase,
	}
}
