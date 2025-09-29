package middleware

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
)

func AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userID, err := uuid.Parse("3e58dbdb-d445-1d13-56e7-4cadb7c85a24")
			if err != nil {
				message := "ユーザーIDの取得に失敗しました"
				resp := api.ErrorResponse{
					Message: message,
				}
				return c.JSON(http.StatusUnauthorized, resp)
			}

			c.Set("uid", userID)

			return next(c)
		}
	}
}
