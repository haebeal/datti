package server

import (
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/labstack/echo/v4"
)

type LendingHandler interface {
	Create(c echo.Context) error
	Get(c echo.Context, id string) error
}

type Server struct {
	lh LendingHandler
	hh handler.HealthHandler
}

func NewServer(lh LendingHandler, hh handler.HealthHandler) api.ServerInterface {
	return &Server{
		lh: lh,
		hh: hh,
	}
}

// ServerInterfaceの実装
func (s *Server) LendingCreate(ctx echo.Context) error {
	return s.lh.Create(ctx)
}

func (s *Server) LendingGet(ctx echo.Context, id string) error {
	return s.lh.Get(ctx, id)
}

func (s *Server) HealthCheckCheck(ctx echo.Context) error {
	return s.hh.Check(ctx)
}
