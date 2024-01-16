package utils

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"google.golang.org/api/option"
	"google.golang.org/api/people/v1"
)

// 指定されたトークンを使用してPeople APIクライアントを作成
func PeopleMmiddleware(c *gin.Context) {
	log.Print("peopleAPIミドルウェアの処理を開始")
	// コンテキストからトークンを取得
	val, exists := c.Get("google_access_token")
	if !exists {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
	}
	accessToken := castStringValue(val)
	oauthClient := oauth2.NewClient(c, oauth2.StaticTokenSource(&oauth2.Token{AccessToken: accessToken}))

	// トークンを元にクライアントを生成
	srv, err := people.NewService(c, option.WithHTTPClient(oauthClient))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
	}

	// peopleAPIからプロフィール情報を取得
	userInfo, err := srv.People.Get("people/me").PersonFields("names,emailAddresses").Do()
	if err != nil {
		log.Printf("プロフィール情報の取得に失敗: %+v", err)
	} else {
		// コンテキストに名前とメールアドレスを追加
		log.Print(userInfo)
	}

	log.Print("peopleAPIミドルウェアの処理を終了")
	// 次のミドルウェアへコンテキストを伝播
	c.Next()
}

func castStringValue(value interface{}) string {
	if str, ok := value.(*string); ok {
		return *str
	}
	return ""
}
