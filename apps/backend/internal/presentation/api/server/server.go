package server

import (
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/labstack/echo/v4"
)

type Server struct {
	ph handler.PaymentHandler
	hh handler.HealthHandler
}

func NewServer(ph handler.PaymentHandler, hh handler.HealthHandler) api.ServerInterface {
	return &Server{
		ph: ph,
		hh: hh,
	}
}

// ServerInterfaceの実装
func (s *Server) PaymentEventCreate(ctx echo.Context) error {
	return s.ph.Create(ctx)
}

func (s *Server) PaymentEventGet(ctx echo.Context, id string) error {
	return s.ph.Get(ctx, id)
}

func (s *Server) HealthCheckCheck(ctx echo.Context) error {
	return s.hh.Check(ctx)
}
