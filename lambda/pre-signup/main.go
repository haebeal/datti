package main

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
)

var cognitoClient *cognitoidentityprovider.Client

func init() {
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		log.Fatalf("AWS設定の読み込みに失敗しました: %v", err)
	}
	cognitoClient = cognitoidentityprovider.NewFromConfig(cfg)
}

func handler(ctx context.Context, event events.CognitoEventUserPoolsPreSignup) (events.CognitoEventUserPoolsPreSignup, error) {
	// 外部プロバイダからのサインアップのみ処理
	if event.TriggerSource != "PreSignUp_ExternalProvider" {
		event.Response.AutoConfirmUser = true
		event.Response.AutoVerifyEmail = true
		return event, nil
	}

	email, ok := event.Request.UserAttributes["email"]
	if !ok || email == "" {
		log.Println("メールアドレスが取得できませんでした")
		event.Response.AutoConfirmUser = true
		event.Response.AutoVerifyEmail = true
		return event, nil
	}

	// 同じメールアドレスの既存ユーザーを検索
	result, err := cognitoClient.ListUsers(ctx, &cognitoidentityprovider.ListUsersInput{
		UserPoolId: aws.String(event.UserPoolID),
		Filter:     aws.String(fmt.Sprintf("email = \"%s\"", email)),
	})
	if err != nil {
		log.Printf("ユーザー検索に失敗しました: %v", err)
		return event, err
	}

	// 既存ユーザーが見つかった場合、プロバイダをリンク
	for _, user := range result.Users {
		if aws.ToString(user.Username) == event.UserName {
			continue
		}

		// 外部プロバイダ情報を解析（例: "LINE_U1234567890abcdef"）
		providerName, providerUserID, err := parseExternalUsername(event.UserName)
		if err != nil {
			log.Printf("外部ユーザー名のパースに失敗しました: %v", err)
			return event, err
		}

		_, err = cognitoClient.AdminLinkProviderForUser(ctx, &cognitoidentityprovider.AdminLinkProviderForUserInput{
			UserPoolId: aws.String(event.UserPoolID),
			DestinationUser: &types.ProviderUserIdentifierType{
				ProviderName:           aws.String("Cognito"),
				ProviderAttributeValue: aws.String(aws.ToString(user.Username)),
			},
			SourceUser: &types.ProviderUserIdentifierType{
				ProviderName:           aws.String(providerName),
				ProviderAttributeName:  aws.String("Cognito_Subject"),
				ProviderAttributeValue: aws.String(providerUserID),
			},
		})
		if err != nil {
			log.Printf("プロバイダリンクに失敗しました: %v", err)
			return event, err
		}

		log.Printf("ユーザー %s にプロバイダ %s をリンクしました", aws.ToString(user.Username), providerName)
		break
	}

	event.Response.AutoConfirmUser = true
	event.Response.AutoVerifyEmail = true
	return event, nil
}

// parseExternalUsername "ProviderName_ProviderUserID" 形式のユーザー名を分割する
func parseExternalUsername(username string) (providerName string, providerUserID string, err error) {
	for i, c := range username {
		if c == '_' {
			return username[:i], username[i+1:], nil
		}
	}
	return "", "", fmt.Errorf("外部ユーザー名の形式が不正です: %s", username)
}

func main() {
	lambda.Start(handler)
}
