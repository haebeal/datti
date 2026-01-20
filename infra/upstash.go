package main

import (
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/upstash/pulumi-upstash/sdk/go/upstash"
)

func createUpstashResources(ctx *pulumi.Context) error {
	_, err := upstash.NewRedisDatabase(ctx, "datti-dev",
		&upstash.RedisDatabaseArgs{
			DatabaseName:  pulumi.String("datti-dev"),
			Region:        pulumi.String("global"),
			PrimaryRegion: pulumi.String("ap-northeast-1"),
			Tls:           pulumi.Bool(true),
		})
	if err != nil {
		return err
	}

	return nil
}
