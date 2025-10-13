package handler

import (
	"net/http"
	"time"

	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/presentation/api/server"
	"github.com/labstack/echo/v4"
)

type HealthHandler struct{}

func NewHealthHandler() server.HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) Check(c echo.Context) error {
	_, span := tracer.Start(c.Request().Context(), "health.Check")
	defer span.End()

	res := &api.HealthCheckResponse{
		Status:    api.Ok,
		Timestamp: time.Now(),
	}

	return c.JSON(http.StatusOK, res)
}
