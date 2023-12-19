package handler

import (
	"errors"
	"net/http"
	"strings"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/usecase"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"google.golang.org/api/people/v1"
	"gorm.io/gorm"
)

type UserHandler interface {
	HandleSingIn(c *gin.Context)
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

// HandleSingIn implements UserHandler.
func (uh *userHandler) HandleSingIn(c *gin.Context) {
	// リクエストヘッダーからアクセストークンを取得
	token := strings.Split(c.Request.Header.Get("Authorization"), " ")[1]

	// people APIクライアントの生成
	client, err := google.DefaultClient(c, people.UserinfoEmailScope, token)
	if err != nil {
		c.AbortWithError(http.StatusUnauthorized, err)
	}

	srv, err := people.NewService(c, option.WithHTTPClient(client))
	if err != nil {
		c.AbortWithError(http.StatusUnauthorized, err)
	}

	// APIクライアントを使用してユーザーのEmail情報を取得する
	userInfo, err := srv.People.Get("people/me").PersonFields("emailAddresses").Do()
	if err != nil {
		c.AbortWithError(http.StatusUnauthorized, err)
	} else {
		// 取得したメールアドレスでDBと突合
		user := new(model.User)
		user.Name = userInfo.Names[1].DisplayName
		user.Email = userInfo.EmailAddresses[1].DisplayName

		buttUser, err := uh.useCase.GetUserByEmail(c, user)
		if err != nil {
			// emailと合致するレコードが存在しない
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// userを登録する
				newUser, err := uh.useCase.CreateUser(c, user)
				if err != nil {
					c.AbortWithError(http.StatusInternalServerError, err)
				} else {
					c.JSON(http.StatusOK, newUser)
				}
				// レコードが存在しな場合以外のエラー
			} else {
				c.AbortWithError(http.StatusInternalServerError, err)
			}
		}
		c.JSON(http.StatusOK, buttUser)
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
