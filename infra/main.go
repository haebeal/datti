package main

import (
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		if err := createUpstashResources(ctx); err != nil {
			return err
		}

		if err := createNeonResources(ctx); err != nil {
			return err
		}

		if err := createAWSResources(ctx); err != nil {
			return err
		}

		return nil
	})
}
