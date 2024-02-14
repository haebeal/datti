package handler

import (
	"log"
	"net/http"

	"github.com/datti-api/pkg/interface/request"
	"github.com/datti-api/pkg/interface/response"
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
func (ph *profileHandler) HandleGet(c echo.Context) error {
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)
	idToken := c.Get("idToken").(string)

	profile, err := ph.useCase.GetProfile(c.Request().Context(), idToken, uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		return c.JSON(http.StatusOK, profile)
	}
}

// HandleUpdateName implements ProfileHandler.
func (ph *profileHandler) HandleUpdate(c echo.Context) error {
	req := new(request.ProfileRequest)
	errRes := new(response.Error)
	uid := c.Get("uid").(string)
	idToken := c.Get("idToken").(string)

	if err := c.Bind(req); err != nil {
		log.Print("failed json bind")
		errRes.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errRes)
	}

	profile, err := ph.useCase.UpdateProfile(c.Request().Context(), idToken, uid, req.Name, req.Url)
	if err != nil {
		errRes.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRes)
	} else {
		return c.JSON(http.StatusOK, profile)
	}
}

func NewProfileHandler(profileUseCase usecase.ProflielUseCase) ProfileHandler {
	return &profileHandler{
		useCase: profileUseCase,
	}
}
