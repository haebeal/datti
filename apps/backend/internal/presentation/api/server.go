package api

import (
	"github.com/labstack/echo/v4"
)

type Server struct {
	ph PaymentHandler
}

func NewServer(ph PaymentHandler) ServerInterface {
	return &Server{
		ph: ph,
	}
}

// ServerInterfaceの実装
func (s *Server) PaymentEventCreate(ctx echo.Context) error {
	return s.ph.Create(ctx)
}
