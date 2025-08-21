package handler

import (
	"net/http"
	"time"

	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
)

type HealthHandler interface {
	Check(c echo.Context) error
}

type healthHandler struct{}

func NewHealthHandler() HealthHandler {
	return &healthHandler{}
}

func (h *healthHandler) Check(c echo.Context) error {
	res := &api.HealthHealthResponse{
		Status:    api.Ok,
		Timestamp: time.Now(),
	}

	return c.JSON(http.StatusOK, res)
}