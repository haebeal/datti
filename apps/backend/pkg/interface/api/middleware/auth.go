package auth

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/haebeal/datti/pkg/interface/response"
	"github.com/labstack/echo/v4"
	"github.com/supabase-community/gotrue-go"
)

func AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			errRes := new(response.Error)
			log.Print("Auth middleware start")
			accessToken := ""

			// supabaseプロジェクトのクレデンシャルを環境変数から取得
			projectReference := os.Getenv("SUPABASE_PROJECT_REFERENCE")
			apiKey := os.Getenv("SUPABASE_API_KEY")

			// クライアントから渡されたトークンを取得
			arr := strings.Split(c.Request().Header.Get("Authorization"), " ")
			if len(arr) != 2 {
				// 不正なトークンの形式であるためセッションを中断する
				log.Printf("AccessToenの形式が不正: %+v", arr)
				errRes.Error = "invalid token format"
				return c.JSON(http.StatusUnauthorized, errRes)
			}
			accessToken = arr[1]

			// supabaseAuthクライアントの初期化
			client := gotrue.New(
				projectReference,
				apiKey,
			)

			// トークンの検証
			authedClient := client.WithToken(accessToken)
			user, err := authedClient.GetUser()
			if err != nil {
				errRes.Error = "invalid token"
				return c.JSON(http.StatusUnauthorized, errRes)
			}

			// AccessトークンとユーザーIDをコンテキストに登録
			c.Set("uid", user.ID.String())
			c.Set("idToken", accessToken)

			return next(c)
		}
	}
}
