package server

import (
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/labstack/echo/v4"
)

type Server struct {
	ph handler.PaymentHandler
}

func NewServer(ph handler.PaymentHandler) api.ServerInterface {
	return &Server{
		ph: ph,
	}
}

// ServerInterfaceの実装
func (s *Server) PaymentEventCreate(ctx echo.Context) error {
	return s.ph.Create(ctx)
}
