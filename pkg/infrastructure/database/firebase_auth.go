package database

import (
	"context"
	"log"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/datti-api/pkg/interface/response"
	"google.golang.org/api/option"
)

type FireBaseTenantClient struct {
	Client *auth.TenantClient
}

func NewFireBaseClient() (*FireBaseTenantClient, error) {
	c := context.Background()
	errRes := new(response.Error)
	// Firebase SDKの初期化
	credential := []byte(os.Getenv("GOOGLE_CREDENTIALS_JSON"))
	opt := option.WithCredentialsJSON(credential)
	app, err := firebase.NewApp(c, nil, opt)
	if err != nil {
		log.Printf("Error initializing Firebase app: %v", err)
		errRes.Error = err.Error()
		return nil, err
	}

	// authClientの初期化
	client, err := app.Auth(c)
	if err != nil {
		log.Printf("failed init auht client %v/n", err)
		errRes.Error = err.Error()
		return nil, err
	}

	tenantClient, err := client.TenantManager.AuthForTenant(os.Getenv("FIREBASE_AUTH_TENANT"))
	if err != nil {
		log.Printf("failed init auht client %v/n", err)
		errRes.Error = err.Error()
		return nil, err
	}

	return &FireBaseTenantClient{
		Client: tenantClient,
	}, nil
}
