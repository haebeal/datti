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
	HandleGetByEmail(c echo.Context) error
	HandleUpdate(c echo.Context) error
}

type profileHandler struct {
	useCase usecase.ProflielUseCase
}

// HandleGet implements ProfileHandler.
func (ph *profileHandler) HandleGet(c echo.Context) error {
	res := new(response.Profile)
	errResponse := new(response.Error)
	uid := c.Get("uid").(string)
	idToken := c.Get("idToken").(string)

	profile, err := ph.useCase.GetProfile(c.Request().Context(), idToken, uid)
	if err != nil {
		errResponse.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errResponse)
	} else {
		res.UID = profile.ID
		res.Name = profile.Name
		res.PhotoUrl = profile.PhotoUrl
		return c.JSON(http.StatusOK, res)
	}
}

// HandleGetByEmail implements ProfileHandler.
func (ph *profileHandler) HandleGetByEmail(c echo.Context) error {
	res := new(response.Profile)
	req := new(request.ProfileGetByEmailRequest)
	errRes := new(response.Error)
	idToken := c.Get("idToken").(string)

	if err := c.Bind(req); err != nil {
		log.Print("failed json bind")
		errRes.Error = err.Error()
		return c.JSON(http.StatusBadRequest, errRes)
	}

	profile, err := ph.useCase.GetProfileByEmail(c.Request().Context(), idToken, req.Email)
	if err != nil {
		errRes.Error = err.Error()
		return c.JSON(http.StatusInternalServerError, errRes)
	} else {
		res.UID = profile.ID
		res.Name = profile.Name
		res.PhotoUrl = profile.PhotoUrl
		return c.JSON(http.StatusOK, res)
	}
}

// HandleUpdateName implements ProfileHandler.
func (ph *profileHandler) HandleUpdate(c echo.Context) error {
	req := new(request.ProfileUpdateRequest)
	res := new(response.Profile)
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
		res.UID = profile.ID
		res.Name = profile.Name
		res.PhotoUrl = profile.PhotoUrl
		return c.JSON(http.StatusOK, res)
	}
}

func NewProfileHandler(profileUseCase usecase.ProflielUseCase) ProfileHandler {
	return &profileHandler{
		useCase: profileUseCase,
	}
}
