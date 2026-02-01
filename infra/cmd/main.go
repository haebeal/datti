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
	shared.NewStack(app, "DattiSharedStack", &shared.StackProps{
		StackProps: awscdk.StackProps{
			Env: region,
		},
	})

	// Dev 環境用の環境変数
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	if googleClientID == "" || googleClientSecret == "" {
		panic("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required")
	}

	// Dev 環境スタック
	env.NewStack(app, "DattiDevStack", &env.StackProps{
		StackProps: awscdk.StackProps{
			Env: region,
		},
		Env:                "dev",
		GoogleClientID:     googleClientID,
		GoogleClientSecret: googleClientSecret,
	})

	app.Synth(nil)
}
