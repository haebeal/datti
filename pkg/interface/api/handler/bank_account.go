package handler

import (
	"github.com/datti-api/pkg/usecase"
	"github.com/gin-gonic/gin"
)

type BankAccountHandler interface {
	HandleCreate(c *gin.Context)
	HandleGet(c *gin.Context)
	HandleUpdate(c *gin.Context)
}

type bankAccountHandler struct {
	useCase usecase.BankAccountUseCase
}

// HandleCreate implements BankAccountHandler.
func (*bankAccountHandler) HandleCreate(c *gin.Context) {
	panic("unimplemented")
}

// HandleGet implements BankAccountHandler.
func (*bankAccountHandler) HandleGet(c *gin.Context) {
	panic("unimplemented")
}

// HandleUpdate implements BankAccountHandler.
func (*bankAccountHandler) HandleUpdate(c *gin.Context) {
	panic("unimplemented")
}

func NewBankAccountHandler(bankAccountUseCase usecase.BankAccountUseCase) BankAccountHandler {
	return &bankAccountHandler{
		useCase: bankAccountUseCase,
	}
}
