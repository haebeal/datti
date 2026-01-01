package server

import (
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
)

type LendingHandler interface {
	Create(c echo.Context, id string) error
	Get(c echo.Context, id string, lendingId string) error
	GetAll(c echo.Context, id string) error
	Update(c echo.Context, id string, lendingId string) error
	Delete(c echo.Context, id string, lendingId string) error
}

type BorrowingHandler interface {
	Get(c echo.Context, id string, borrowingId string) error
	GetAll(c echo.Context, id string) error
}

type CreditHandler interface {
	List(c echo.Context) error
}

type HealthHandler interface {
	Check(c echo.Context) error
}

type RepaymentHandler interface {
	Create(c echo.Context) error
	GetAll(c echo.Context) error
	Get(c echo.Context, id string) error
	Update(c echo.Context, id string) error
	Delete(c echo.Context, id string) error
}

type GroupHandler interface {
	Create(c echo.Context) error
	GetAll(c echo.Context) error
	Get(c echo.Context, id string) error
	Update(c echo.Context, id string) error
	Delete(c echo.Context, id string) error
	AddMember(c echo.Context, id string) error
	GetMembers(c echo.Context, id string) error
}

type UserHandler interface {
	Search(c echo.Context, params api.UserSearchParams) error
	Get(c echo.Context, id string) error
	GetMe(c echo.Context) error
	Update(c echo.Context, id string) error
}

type AuthHandler interface {
	Login(c echo.Context) error
	Signup(c echo.Context) error
}

type Server struct {
	lh LendingHandler
	bh BorrowingHandler
	ch CreditHandler
	hh HealthHandler
	rh RepaymentHandler
	gh GroupHandler
	uh UserHandler
	ah AuthHandler
}

func NewServer(lh LendingHandler, bh BorrowingHandler, ch CreditHandler, hh HealthHandler, rh RepaymentHandler, gh GroupHandler, uh UserHandler, ah AuthHandler) api.ServerInterface {
	return &Server{
		lh: lh,
		bh: bh,
		ch: ch,
		hh: hh,
		rh: rh,
		gh: gh,
		uh: uh,
		ah: ah,
	}
}

// ServerInterfaceの実装
func (s *Server) LendingCreate(ctx echo.Context, id string) error {
	return s.lh.Create(ctx, id)
}

func (s *Server) LendingGet(ctx echo.Context, id string, lendingId string) error {
	return s.lh.Get(ctx, id, lendingId)
}

func (s *Server) LendingGetAll(ctx echo.Context, id string) error {
	return s.lh.GetAll(ctx, id)
}

func (s *Server) LendingUpdate(ctx echo.Context, id string, lendingId string) error {
	return s.lh.Update(ctx, id, lendingId)
}

func (s *Server) LendingDelete(ctx echo.Context, id string, lendingId string) error {
	return s.lh.Delete(ctx, id, lendingId)
}

func (s *Server) BorrowingGetAll(ctx echo.Context, id string) error {
	return s.bh.GetAll(ctx, id)
}

func (s *Server) BorrowingGet(ctx echo.Context, id string, borrowingId string) error {
	return s.bh.Get(ctx, id, borrowingId)
}

func (s *Server) CreditsList(ctx echo.Context) error {
	return s.ch.List(ctx)
}

func (s *Server) HealthCheck(ctx echo.Context) error {
	return s.hh.Check(ctx)
}

func (s *Server) RepaymentCreate(ctx echo.Context) error {
	return s.rh.Create(ctx)
}

func (s *Server) RepaymentGetAll(ctx echo.Context) error {
	return s.rh.GetAll(ctx)
}

func (s *Server) RepaymentGet(ctx echo.Context, id string) error {
	return s.rh.Get(ctx, id)
}

func (s *Server) RepaymentUpdate(ctx echo.Context, id string) error {
	return s.rh.Update(ctx, id)
}

func (s *Server) RepaymentDelete(ctx echo.Context, id string) error {
	return s.rh.Delete(ctx, id)
}

func (s *Server) GroupCreate(ctx echo.Context) error {
	return s.gh.Create(ctx)
}

func (s *Server) GroupGetAll(ctx echo.Context) error {
	return s.gh.GetAll(ctx)
}

func (s *Server) GroupGet(ctx echo.Context, id string) error {
	return s.gh.Get(ctx, id)
}

func (s *Server) GroupUpdate(ctx echo.Context, id string) error {
	return s.gh.Update(ctx, id)
}

func (s *Server) GroupDelete(ctx echo.Context, id string) error {
	return s.gh.Delete(ctx, id)
}

func (s *Server) GroupAddMember(ctx echo.Context, id string) error {
	return s.gh.AddMember(ctx, id)
}

func (s *Server) GroupGetMembers(ctx echo.Context, id string) error {
	return s.gh.GetMembers(ctx, id)
}

func (s *Server) UserSearch(ctx echo.Context, params api.UserSearchParams) error {
	return s.uh.Search(ctx, params)
}

func (s *Server) UserGet(ctx echo.Context, id string) error {
	return s.uh.Get(ctx, id)
}

func (s *Server) UserGetMe(ctx echo.Context) error {
	return s.uh.GetMe(ctx)
}

func (s *Server) UserUpdate(ctx echo.Context, id string) error {
	return s.uh.Update(ctx, id)
}

func (s *Server) AuthLogin(ctx echo.Context) error {
	return s.ah.Login(ctx)
}

func (s *Server) AuthSignup(ctx echo.Context) error {
	return s.ah.Signup(ctx)
}
