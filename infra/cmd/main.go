package main

import (
	"os"

	"cdk/internal/stack"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
)

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	if googleClientID == "" || googleClientSecret == "" {
		panic("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required")
	}

	stack.NewDattiStack(app, "DevDattiStack", &stack.DattiStackProps{
		StackProps: awscdk.StackProps{
			Env: &awscdk.Environment{
				Region: jsii.String("ap-northeast-1"),
			},
		},
		Env:                "dev",
		GoogleClientID:     googleClientID,
		GoogleClientSecret: googleClientSecret,
	})

	app.Synth(nil)
}
