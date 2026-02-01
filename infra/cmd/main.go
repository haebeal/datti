package main

import (
	"os"

	"cdk/internal/env"
	"cdk/internal/shared"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
)

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	region := &awscdk.Environment{
		Region: jsii.String("ap-northeast-1"),
	}

	// 共有スタック（VPC, ECS Cluster, ECR, GitHub OIDC）
	shared.NewStack(app, "SharedDattiStack", &shared.StackProps{
		StackProps: awscdk.StackProps{
			Env: region,
		},
	})

	// Dev 環境用の環境変数
	devGoogleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	devGoogleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	if devGoogleClientID != "" && devGoogleClientSecret != "" {
		env.NewStack(app, "DevDattiStack", &env.StackProps{
			StackProps: awscdk.StackProps{
				Env: region,
			},
			Env:                "dev",
			GoogleClientID:     devGoogleClientID,
			GoogleClientSecret: devGoogleClientSecret,
		})
	}

	// Prod 環境用の環境変数
	prodGoogleClientID := os.Getenv("GOOGLE_CLIENT_ID_PROD")
	prodGoogleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET_PROD")

	if prodGoogleClientID != "" && prodGoogleClientSecret != "" {
		env.NewStack(app, "ProdDattiStack", &env.StackProps{
			StackProps: awscdk.StackProps{
				Env: region,
			},
			Env:                "prod",
			GoogleClientID:     prodGoogleClientID,
			GoogleClientSecret: prodGoogleClientSecret,
		})
	}

	app.Synth(nil)
}
