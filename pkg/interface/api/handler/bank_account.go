package handler

import (
	"errors"
	"log"
	"net/http"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/usecase"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BankAccountHandler interface {
	HandleUpsert(c *gin.Context)
	HandleGet(c *gin.Context)
	HandleUpdate(c *gin.Context)
}

type bankAccountHandler struct {
	useCase usecase.BankAccountUseCase
}

// HandleCreate implements BankAccountHandler.
func (bh *bankAccountHandler) HandleUpsert(c *gin.Context) {
	uid := ""
	val, exsist := c.Get("uid")
	if exsist {
		uid = val.(string)
	}

	bankAccount := new(model.BankAccount)
	if err := c.BindJSON(&bankAccount); err != nil {
		log.Print("failed json bind")
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "リクエストボディの値が不正"})
		return
	}

	bankAccount.UserID = uid
	newBankAccount, err := bh.useCase.UpsertBankAccount(c, bankAccount)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	} else {
		c.JSON(http.StatusCreated, newBankAccount)
	}
}

// HandleGet implements BankAccountHandler.
func (bh *bankAccountHandler) HandleGet(c *gin.Context) {
	uid := ""
	val, exsist := c.Get("uid")
	if exsist {
		uid = val.(string)
	}

	user := new(model.User)
	user.ID = uid

	findBankAccount, err := bh.useCase.GetBankAccountById(c, user)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		} else {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		c.JSON(http.StatusOK, findBankAccount)
		return
	}
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
