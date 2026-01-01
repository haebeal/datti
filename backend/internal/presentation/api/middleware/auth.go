package middleware

import (
	"net/http"
	"strings"

	"github.com/haebeal/datti/internal/gateway/firebase"
	"github.com/haebeal/datti/internal/presentation/api"
	"github.com/labstack/echo/v4"
)

// AuthMiddlewareConfig holds configuration for the auth middleware
type AuthMiddlewareConfig struct {
	FirebaseClient *firebase.Client
	SkipPaths      []string
	DevMode        bool
	DevUserID      string
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

			// Dev mode: use hardcoded user ID
			if cfg.DevMode {
				c.Set("uid", cfg.DevUserID)
				return next(c)
			}

			// Extract Bearer token from Authorization header
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
			idToken := parts[1]

			// Verify token with Firebase
			claims, err := cfg.FirebaseClient.VerifyToken(c.Request().Context(), idToken)
			if err != nil {
				// Debug: log the error
				c.Logger().Errorf("Token verification failed: %v", err)
				return c.JSON(http.StatusUnauthorized, api.ErrorResponse{
					Message: "Invalid or expired token",
				})
			}

			// Set user ID from token claims
			c.Set("uid", claims.UID)

			return next(c)
		}
	}
}

