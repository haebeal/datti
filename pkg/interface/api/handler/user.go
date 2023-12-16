package handler

import (
	"net/http"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/usecase"
	"github.com/gin-gonic/gin"
)

type UserHandler interface {
	HandlerCreate(c *gin.Context)
	HandlerGet(c *gin.Context)
	HandlerUpdate(c *gin.Context)
}

type userHandler struct {
	useCase usecase.UserUseCase
}

func NewUserHandler(userUseCase usecase.UserUseCase) UserHandler {
	return &userHandler{
		useCase: userUseCase,
	}
}

// HandlerCreate implements UserHandler.
func (uh *userHandler) HandlerCreate(c *gin.Context) {
	user := new(model.User)
	if err := c.Bind(&user); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
	}

	newUser, err := uh.useCase.CreateUser(c, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
	} else {
		c.JSON(http.StatusCreated, gin.H{"user": newUser})
	}
}

// HandlerGet implements UserHandler.
func (*userHandler) HandlerGet(c *gin.Context) {
	panic("unimplemented")
}

// HandlerUpdate implements UserHandler.
func (*userHandler) HandlerUpdate(c *gin.Context) {
	panic("unimplemented")
}
