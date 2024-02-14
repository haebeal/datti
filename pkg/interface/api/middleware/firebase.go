package auth

import (
	"log"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go/v4"
	"github.com/datti-api/pkg/interface/response"
	"github.com/labstack/echo/v4"
	"google.golang.org/api/option"
)

func FirebaseAuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			errRes := new(response.Error)
			log.Print("firebaseAuth middleware start")
			idToken := ""
			arr := strings.Split(c.Request().Header.Get("Authorization"), " ")
			if len(arr) != 2 {
				// 不正なトークンの形式であるためセッションを中断する
				log.Printf("idToenの形式が不正: %+v", arr)
				errRes.Error = "invalid token format"
				return c.JSON(http.StatusUnauthorized, errRes)
			}
			idToken = arr[1]

			// Firebase SDKの初期化
			credential := []byte(os.Getenv("GOOGLE_CREDENTIALS_JSON"))
			opt := option.WithCredentialsJSON(credential)
			app, err := firebase.NewApp(c.Request().Context(), nil, opt)
			if err != nil {
				log.Printf("Error initializing Firebase app: %v", err)
				errRes.Error = err.Error()
				return c.JSON(http.StatusUnauthorized, errRes)
			}

			// authClientの初期化
			client, err := app.Auth(c.Request().Context())
			if err != nil {
				log.Printf("failed init auht client %v/n", err)
				errRes.Error = err.Error()
				return c.JSON(http.StatusUnauthorized, errRes)
			}
			tenantClient, err := client.TenantManager.AuthForTenant(os.Getenv("FIREBASE_AUTH_TENANT"))
			if err != nil {
				log.Printf("failed init auht client %v/n", err)
				errRes.Error = err.Error()
				return c.JSON(http.StatusUnauthorized, errRes)
			}

			// IDトークンの検証
			token, err := tenantClient.VerifyIDToken(c.Request().Context(), idToken)
			if err != nil {
				log.Printf("failed verifying token %v/n", err)
				errRes.Error = err.Error()
				return c.JSON(http.StatusUnauthorized, errRes)
			}

			u, err := tenantClient.GetUser(c.Request().Context(), token.UID)
			if err != nil {
				log.Printf("error getting user %s: %v\n", token.UID, err)
				errRes.Error = err.Error()
				return c.JSON(http.StatusUnauthorized, errRes)
			}
			log.Printf("Successfully fetched user data")

			uid := u.UID
			c.Set("uid", uid)
			c.Set("idToken", idToken)

			return next(c)
		}
	}
}
