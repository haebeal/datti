package middleware

import (
	"net/http"
	"strings"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
)

type AuthMiddlewareConfig struct {
	SkipPaths []string
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

			cfg, err := config.LoadDefaultConfig(c.Request().Context())
			if err != nil {
				return c.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Message: "AWSへの認証に失敗しました",
				})
			}
			cognitoClient := cognitoidentityprovider.NewFromConfig(cfg)

			user, err := cognitoClient.GetUser(c.Request().Context(), &cognitoidentityprovider.GetUserInput{
				AccessToken: &accessToken,
			})
			if err != nil {
				return c.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Message: "アクセストークンの検証に失敗しました",
				})
			}

			c.Set("uid", user.Username)

			return next(c)
		}
	}
}
