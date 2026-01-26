package main

import (
	"datti-infra/internal/aws"

	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		if err := createUpstashResources(ctx); err != nil {
			return err
		}

		if err := createCloudflareResources(ctx); err != nil {
			return err
		}

		if err := aws.CreateAWSResources(ctx); err != nil {
			return err
		}

		return nil
	})
}
