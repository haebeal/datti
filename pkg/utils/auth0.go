package utils

import (
	"context"
	"fmt"
	"log"

	"github.com/auth0/go-auth0/management"
	"github.com/gin-gonic/gin"
)

func Auth0(c *gin.Context) {
	domain := "your_domain"
	token := "your_token"

	// クライアントの生成
	m, err := management.New(domain, management.WithStaticToken(token))
	if err != nil {
		log.Fatal(err)
	}

	users, err := m.User.List(context.TODO())
	if err != nil {
		log.Fatal(err)
	}

	// ユーザー情報を出力
	for _, user := range users.Users {
		fmt.Println(user)
	}

	c.Next()
}
