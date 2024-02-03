package handler

import (
	"net/http"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/usecase"
	"github.com/gin-gonic/gin"
)

type UserHandler interface {
	HandlerCreate(c *gin.Context)
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

	// リクエストボディから構造体へバインディング
	if err := c.BindJSON(&user); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	// ユーザー情報の新規登録
	newUser, err := uh.useCase.CreateUser(c, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	} else {
		c.JSON(http.StatusCreated, newUser)
	}
}
