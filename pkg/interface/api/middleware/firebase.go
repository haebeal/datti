package middleware

import (
	"log"
	"net/http"
	"os"
	"strings"
	"unsafe"

	firebase "firebase.google.com/go/v4"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

func FirebaseAuthMiddleware(c *gin.Context) {
	log.Print("firebaseAuth middleware start")
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
	credential := []byte(os.Getenv("GOOGLE_CREDENTIALS_JSON"))
	opt := option.WithCredentialsJSON(credential)
	app, err := firebase.NewApp(c, nil, opt)
	if err != nil {
		log.Printf("Error initializing Firebase app: %v", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "firebase SDKの初期化に失敗しました"})
		return
	}
	// authClientの初期化
	client, err := app.Auth(c)
	if err != nil {
		log.Printf("failed init auht client %v/n", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "クライアントの初期化に失敗しました"})
		return
	}

	// IDトークンの検証
	token, err := client.VerifyIDToken(c, idToken)
	if err != nil {
		log.Printf("failed verifying token %v/n", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "IDトークンの検証エラー"})
		return
	}

	name := token.Claims["name"]
	email := token.Claims["email"]
	log.Printf("name:  %v/n", (*string)(unsafe.Pointer(&name)))
	log.Printf("email: %v/n", (*string)(unsafe.Pointer(&email)))
	c.Set("name", (*string)(unsafe.Pointer(&name)))
	c.Set("email", (*string)(unsafe.Pointer(&email)))
	log.Print("firebaseAuth middleware successfly")
	c.Next()
}
