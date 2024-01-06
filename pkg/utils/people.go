package utils

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"google.golang.org/api/option"
	"google.golang.org/api/people/v1"
)

// 指定されたトークンを使用してPeople APIクライアントを作成
func PeopleMmiddleware(c *gin.Context) {
	// コンテキストからトークンを取得
	accessToken := strings.Split(c.Request.Header.Get("Authorization"), " ")[1]
	log.Print(accessToken)
	oauthClient := oauth2.NewClient(c, oauth2.StaticTokenSource(&oauth2.Token{AccessToken: accessToken}))

	// トークンを元にクライアントを生成
	srv, err := people.NewService(c, option.WithHTTPClient(oauthClient))
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
	}

	// peopleAPIからプロフィール情報を取得
	userInfo, err := srv.People.Get("people/me").PersonFields("names,emailAddresses").Do()
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
	}
	// コンテキストに名前とメールアドレスを追加
	c.Set("name", userInfo.Names[0].DisplayName)
	c.Set("email", userInfo.EmailAddresses[0].Value)

	// 次のミドルウェアへコンテキストを伝播
	c.Next()
}
