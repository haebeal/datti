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

	// 共有スタック (GitHub OIDC Role のみ)
	shared.NewStack(app, "SharedDattiStack", &shared.StackProps{
		StackProps: awscdk.StackProps{
			Env: region,
		},
	})

	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	lineChannelID := os.Getenv("LINE_CHANNEL_ID")
	lineChannelSecret := os.Getenv("LINE_CHANNEL_SECRET")

	if googleClientID == "" || googleClientSecret == "" {
		panic("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required")
	}
	if lineChannelID == "" || lineChannelSecret == "" {
		panic("LINE_CHANNEL_ID and LINE_CHANNEL_SECRET environment variables are required")
	}

	// 本番スタック (dev は廃止、ローカル開発は localhost のまま動かす)
	env.NewStack(app, "DattiStack", &env.StackProps{
		StackProps: awscdk.StackProps{
			Env: region,
		},
		GoogleClientID:     googleClientID,
		GoogleClientSecret: googleClientSecret,
		LineChannelID:      lineChannelID,
		LineChannelSecret:  lineChannelSecret,
	})

	app.Synth(nil)
}
