package line

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"go.opentelemetry.io/otel/codes"
)

// Client LINE APIクライアント
type Client struct {
	channelID     string
	channelSecret string
	httpClient    *http.Client
}

// NewClient ClientのファクトリKansu
func NewClient(channelID, channelSecret string) *Client {
	return &Client{
		channelID:     channelID,
		channelSecret: channelSecret,
		httpClient:    http.DefaultClient,
	}
}

// tokenResponse LINE トークンエンドポイントのレスポンス
type tokenResponse struct {
	AccessToken string `json:"access_token"`
	IDToken     string `json:"id_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

// profileResponse LINE プロフィールAPIのレスポンス
type profileResponse struct {
	UserID      string `json:"userId"`
	DisplayName string `json:"displayName"`
	PictureURL  string `json:"pictureUrl"`
}

// GetUserID 認可コードからLINE User IDを取得する
func (c *Client) GetUserID(ctx context.Context, code string, redirectURI string) (userID string, err error) {
	ctx, span := tracer.Start(ctx, "line.Client.GetUserID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// 認可コードでアクセストークンを取得
	accessToken, err := c.exchangeToken(ctx, code, redirectURI)
	if err != nil {
		return "", fmt.Errorf("トークン交換に失敗しました: %w", err)
	}

	// アクセストークンでプロフィールを取得
	profile, err := c.getProfile(ctx, accessToken)
	if err != nil {
		return "", fmt.Errorf("プロフィール取得に失敗しました: %w", err)
	}

	return profile.UserID, nil
}

// exchangeToken 認可コードをアクセストークンに交換する
func (c *Client) exchangeToken(ctx context.Context, code string, redirectURI string) (accessToken string, err error) {
	ctx, span := tracer.Start(ctx, "line.Client.exchangeToken")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	data := url.Values{
		"grant_type":    {"authorization_code"},
		"code":          {code},
		"redirect_uri":  {redirectURI},
		"client_id":     {c.channelID},
		"client_secret": {c.channelSecret},
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.line.me/oauth2/v2.1/token", strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("LINE token API returned status %d", resp.StatusCode)
	}

	var tokenResp tokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", err
	}

	return tokenResp.AccessToken, nil
}

// getProfile アクセストークンでLINEプロフィールを取得する
func (c *Client) getProfile(ctx context.Context, accessToken string) (profile *profileResponse, err error) {
	ctx, span := tracer.Start(ctx, "line.Client.getProfile")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.line.me/v2/profile", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("LINE profile API returned status %d", resp.StatusCode)
	}

	var p profileResponse
	if err := json.NewDecoder(resp.Body).Decode(&p); err != nil {
		return nil, err
	}

	return &p, nil
}
