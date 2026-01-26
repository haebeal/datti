package middleware

import (
	"log"
	"net/http"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
)

type AuthMiddlewareConfig struct {
	CognitoClient *cognitoidentityprovider.Client
	SkipPaths     []string
}

// AuthMiddleware creates an authentication middleware
func AuthMiddleware(cfg AuthMiddlewareConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Skip paths check
			path := c.Request().URL.Path
			for _, skipPath := range cfg.SkipPaths {
				if strings.HasPrefix(path, skipPath) {
					return next(c)
				}
			}

			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Message: "Authorization header is required",
				})
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				return c.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Message: "Invalid authorization header format",
				})
			}
			accessToken := parts[1]

			user, err := cfg.CognitoClient.GetUser(c.Request().Context(), &cognitoidentityprovider.GetUserInput{
				AccessToken: &accessToken,
			})
			if err != nil {
				log.Printf("Cognito GetUser error: %v", err)
				return c.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Message: "アクセストークンの検証に失敗しました",
				})
			}

			var uid string
			for _, attr := range user.UserAttributes {
				if *attr.Name == "sub" {
					uid = *attr.Value
					break
				}
			}
			if uid == "" {
				return c.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Message: "ユーザーIDの取得に失敗しました",
				})
			}

			c.Set("uid", uid)

			return next(c)
		}
	}
}
