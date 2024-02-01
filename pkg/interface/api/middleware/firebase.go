package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go/v4"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

func FirebaseAuthMiddleware(c *gin.Context) {
	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Failed Load environment: %v", err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "環境変数のロードに失敗しました"})
	}

	idToken := ""
	arr := strings.Split(c.Request.Header.Get("Authorization"), " ")
	if len(arr) != 2 {
		// 不正なトークンの形式であるためセッションを中断する
		log.Printf("idToenの形式が不正: %+v", arr)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token format"})
		return
	}
	idToken = arr[1]

	// Firebase SDKの初期化
	opt := option.WithCredentialsJSON([]byte(os.Getenv("GOOGLE_CREDENTIALS_JSON")))
	app, err := firebase.NewApp(c, nil, opt)
	if err != nil {
		log.Printf("Error initializing Firebase app: %v", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "firebase SDKの初期化に失敗しました"})
	}
	// authClientの初期化
	client, err := app.Auth(c)
	if err != nil {
		log.Printf("failed init auht client %v/n", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "クライアントの初期化に失敗しました"})
	}

	// IDトークンの検証
	token, err := client.VerifyIDToken(c, idToken)
	if err != nil {
		log.Printf("failed verifying token %v/n", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "IDトークンの検証エラー"})
	}

	println(token.Claims["name"])
	println(token.Claims["email"])
	c.Set("name", token.Claims["name"])
	c.Set("email", token.Claims["email"])
	c.Next()
}
