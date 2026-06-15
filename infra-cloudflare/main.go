package main

import (
	"github.com/pulumi/pulumi-cloudflare/sdk/v6/go/cloudflare"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		cfg := config.New(ctx, "")
		accountID := cfg.Require("accountId")

		// R2: アバター画像用バケット
		avatarBucket, err := cloudflare.NewR2Bucket(ctx, "avatar", &cloudflare.R2BucketArgs{
			AccountId: pulumi.String(accountID),
			Name:      pulumi.String("datti-avatar"),
			Location:  pulumi.String("apac"),
		})
		if err != nil {
			return err
		}

		// R2: SPA からの Presigned PUT を許可する CORS
		_, err = cloudflare.NewR2BucketCors(ctx, "avatar-cors", &cloudflare.R2BucketCorsArgs{
			AccountId:  pulumi.String(accountID),
			BucketName: avatarBucket.Name,
			Rules: cloudflare.R2BucketCorsRuleArray{
				&cloudflare.R2BucketCorsRuleArgs{
					Allowed: &cloudflare.R2BucketCorsRuleAllowedArgs{
						Origins: pulumi.StringArray{
							pulumi.String("https://datti.app"),
							pulumi.String("http://localhost:3000"),
						},
						Methods: pulumi.StringArray{
							pulumi.String("PUT"),
							pulumi.String("GET"),
						},
						Headers: pulumi.StringArray{
							pulumi.String("*"),
						},
					},
					MaxAgeSeconds: pulumi.Float64(3000),
				},
			},
		})
		if err != nil {
			return err
		}

		// Pages: フロントエンド (datti) プロジェクト。
		// 実デプロイは wrangler-action 経由なので build/source 設定は持たない。
		pagesProject, err := cloudflare.NewPagesProject(ctx, "frontend", &cloudflare.PagesProjectArgs{
			AccountId:        pulumi.String(accountID),
			Name:             pulumi.String("datti"),
			ProductionBranch: pulumi.String("main"),
		})
		if err != nil {
			return err
		}

		ctx.Export("avatarBucketName", avatarBucket.Name)
		ctx.Export("pagesProjectName", pagesProject.Name)
		ctx.Export("pagesProjectSubdomain", pagesProject.Subdomain)
		return nil
	})
}
