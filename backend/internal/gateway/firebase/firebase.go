package firebase

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
)

// Client handles Firebase/Identity Platform token verification
type Client struct {
	auth *auth.Client
}

// TokenClaims represents the claims extracted from a verified token
type TokenClaims struct {
	UID     string
	Email   string
	Name    string
	Picture string
}

// NewClient creates a new Firebase client with the given project ID
func NewClient(ctx context.Context, projectID string) (*Client, error) {
	config := &firebase.Config{
		ProjectID: projectID,
	}

	app, err := firebase.NewApp(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize firebase app: %w", err)
	}

	client, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get auth client: %w", err)
	}

	return &Client{auth: client}, nil
}

// VerifyToken verifies the ID token and returns the claims
func (c *Client) VerifyToken(ctx context.Context, idToken string) (*TokenClaims, error) {
	token, err := c.auth.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, fmt.Errorf("failed to verify ID token: %w", err)
	}

	claims := &TokenClaims{
		UID: token.UID,
	}

	// Extract optional claims
	if email, ok := token.Claims["email"].(string); ok {
		claims.Email = email
	}
	if name, ok := token.Claims["name"].(string); ok {
		claims.Name = name
	}
	if picture, ok := token.Claims["picture"].(string); ok {
		claims.Picture = picture
	}

	return claims, nil
}
