package server

import (
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
)

type LendingHandler interface {
	Create(c echo.Context) error
	Get(c echo.Context, id string) error
	GetAll(c echo.Context) error
	Update(c echo.Context, id string) error
}

type CreditHandler interface {
	List(c echo.Context) error
}

type HealthHandler interface {
	Check(c echo.Context) error
}

type Server struct {
	lh LendingHandler
	ch CreditHandler
	hh HealthHandler
}

func NewServer(lh LendingHandler, ch CreditHandler, hh HealthHandler) api.ServerInterface {
	return &Server{
		lh: lh,
		ch: ch,
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

func (s *Server) LendingGetAll(ctx echo.Context) error {
	return s.lh.GetAll(ctx)
}

func (s *Server) LendingUpdate(ctx echo.Context, id string) error {
	return s.lh.Update(ctx, id)
}

func (s *Server) CreditsList(ctx echo.Context) error {
	return s.ch.List(ctx)
}

func (s *Server) HealthCheck(ctx echo.Context) error {
	return s.hh.Check(ctx)
}
