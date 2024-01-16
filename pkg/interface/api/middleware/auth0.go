package middleware

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/auth0/go-auth0/authentication"
	"github.com/auth0/go-auth0/management"
	"github.com/gin-gonic/gin"
)

// AuthorizationAPI用ミドルウェア
func AuthorizationApiMiddleware(c *gin.Context) {
	log.Print("AuthorizationAPI用ミドルウェアの処理を開始")
	domain := os.Getenv("AUTH0_DOMAIN")
	clientID := os.Getenv("CLIENT_ID")
	clientSecret := os.Getenv("CLIENT_SECRET")

	// コンテキストからトークンを取得
	accessToken := ""
	arr := strings.Split(c.Request.Header.Get("Authorization"), " ")
	if len(arr) != 2 {
		// 不正なトークンの形式であるためセッションを中断する
		log.Printf("accessToenの形式が不正: %+v", arr)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token format"})
		return
	}
	accessToken = arr[1]

	auth0API, err := authentication.New(
		context.Background(),
		domain,
		authentication.WithClientID(clientID),
		authentication.WithClientSecret(clientSecret),
	)
	if err != nil {
		log.Printf("AuthorizationAPIクライアントの初期化に失敗: %+v", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "AuthorizationAPIクライアントの初期化に失敗"})
		return
	}

	userProfiel, err := auth0API.UserInfo(context.Background(), accessToken)
	if err != nil {
		log.Printf("ユーザー情報の取得に失敗: %+v", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "ユーザー情報の取得に失敗"})
		return
	}

	userID := userProfiel.Sub
	c.Set("user_id", userID)

	log.Print("AuthorizationAPI用ミドルウェアの処理を終了")
	c.Next()
}

// managementAPI用ミドルウェア
func ManagementApiMiddlewaer(c *gin.Context) {
	log.Print("ManagementAPI用ミドルウェアの処理を開始")
	domain := os.Getenv("AUTH0_DOMAIN")
	clientID := os.Getenv("CLIENT_ID")
	clientSecret := os.Getenv("CLIENT_SECRET")
	userID, exists := c.Get("user_id")
	if !exists {
		log.Printf("ユーザーIDの取得に失敗")
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid userID"})
		return
	}

	auth0API, err := management.New(
		domain,
		management.WithClientCredentials(context.TODO(), clientID, clientSecret), // Replace with a Context that better suits your usage
	)
	if err != nil {
		log.Printf("マネジメントAPIクライアントの初期化に失敗: %+v", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "マネジメントAPIの初期化に失敗"})
		return
	}

	user, err := auth0API.User.Read(context.Background(), userID.(string)) // Replace with a Context that better suits your usage
	if err != nil {
		log.Fatalf("ユーザー情報の取得に失敗: %+v", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "ユーザー情報の取得に失敗"})
		return
	}

	log.Printf("%v", user)
	c.Set("google_access_token", user.Identities[0].AccessToken)
	c.Set("name", user.Name)
	c.Set("email", user.Email)

	log.Print("ManagementAPI用ミドルウェアの処理を終了")
	c.Next()
}
