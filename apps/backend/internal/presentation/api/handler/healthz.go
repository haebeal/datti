package handler

import (
	"net/http"
	"time"

	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/presentation/api/server"
	"github.com/labstack/echo/v4"
)

type HealthzHandler struct{}

func NewHealthzHandler() server.HealthzHandler {
	return &HealthzHandler{}
}

func (h *HealthzHandler) Check(c echo.Context) error {
	_, span := tracer.Start(c.Request().Context(), "healthz.Check")
	defer span.End()

	res := &api.HealthCheckResponse{
		Status:    api.Ok,
		Timestamp: time.Now(),
	}

	return c.JSON(http.StatusOK, res)
}
