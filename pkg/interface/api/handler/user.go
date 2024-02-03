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

// HandlerGet implements UserHandler.
func (uh *userHandler) HandlerGet(c *gin.Context) {
	user := new(model.User)
	// name, exsist := c.Get("name")
	// if exsist {
	// 	if str, ok := name.(*string); ok {
	// 		user.Name = *str
	// 	} else {
	// 		log.Fatal("cast error")
	// 		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"err": "ユーザー情報の失敗しました"})
	// 	}
	// }
	email, exsist := c.Get("email")
	if exsist {
		if str, ok := email.(string); ok {
			user.Email = str
		} else {
			log.Fatal("cast error")
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"err": "ユーザー情報の取得に失敗"})
		}
	}

	findUser, err := uh.useCase.GetUserByEmail(c, user)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
	} else {
		c.JSON(http.StatusOK, findUser)
	}
}

// HandlerUpdate implements UserHandler.
func (uh *userHandler) HandlerUpdate(c *gin.Context) {
	user := new(model.User)
	if err := c.BindJSON(&user); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	// 更新用のフィールを作成
	// requestField := make(map[string]any)
	// if user.Name != "" {
	// 	requestField["Name"] = user.Name
	// }
	// if user.PhotoUrl != "" {
	// 	requestField["PhotoUrl"] = user.PhotoUrl
	// }
	// if user.AccountCode != "" {
	// 	requestField["AccountCode"] = user.AccountCode
	// }
	// if user.BankCode != "" {
	// 	requestField["BankCode"] = user.BankCode
	// }
	// if user.BranchCode != "" {
	// 	requestField["BranchCode"] = user.BranchCode
	// }
	// email := ""
	// if parm, exsist := c.Get("email"); exsist {
	// 	email = parm.(string)
	// }

	updateUser, err := uh.useCase.UpdateUser(c, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	} else {
		c.JSON(http.StatusOK, updateUser)
	}
}
