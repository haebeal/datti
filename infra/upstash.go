package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/upstash/pulumi-upstash/sdk/go/upstash"
)

func createUpstashResources(ctx *pulumi.Context) error {
	redisDev, err := upstash.NewRedisDatabase(ctx, "datti-dev",
		&upstash.RedisDatabaseArgs{
			DatabaseName:  pulumi.String("datti-dev"),
			Region:        pulumi.String("global"),
			PrimaryRegion: pulumi.String("ap-northeast-1"),
			Tls:           pulumi.Bool(true),
		})
	if err != nil {
		return err
	}

	// SSMパラメータ Upstash Redis URL
	_, err = ssm.NewParameter(ctx, "datti-dev-upstash-url", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/dev/frontend/UPSTASH_REDIS_REST_URL"),
		Type:  pulumi.String("String"),
		Value: redisDev.Endpoint,
	})
	if err != nil {
		return err
	}

	// SSMパラメータ Upstash Redis Token
	_, err = ssm.NewParameter(ctx, "datti-dev-upstash-token", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/dev/frontend/UPSTASH_REDIS_REST_TOKEN"),
		Type:  pulumi.String("SecureString"),
		Value: redisDev.RestToken,
	})
	if err != nil {
		return err
	}

	return nil
}
