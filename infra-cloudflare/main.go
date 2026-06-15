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
		zoneID := cfg.Require("zoneId")

		// R2: 静的アセット (アバター画像など) を配信する CDN バケット
		cdnBucket, err := cloudflare.NewR2Bucket(ctx, "cdn", &cloudflare.R2BucketArgs{
			AccountId: pulumi.String(accountID),
			Name:      pulumi.String("datti-cdn"),
			Location:  pulumi.String("apac"),
		})
		if err != nil {
			return err
		}

		// R2: SPA からの Presigned PUT を許可する CORS
		_, err = cloudflare.NewR2BucketCors(ctx, "cdn-cors", &cloudflare.R2BucketCorsArgs{
			AccountId:  pulumi.String(accountID),
			BucketName: cdnBucket.Name,
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

		// R2: 公開 URL を cdn.datti.app にバインドする
		_, err = cloudflare.NewR2CustomDomain(ctx, "cdn-domain", &cloudflare.R2CustomDomainArgs{
			AccountId:  pulumi.String(accountID),
			BucketName: cdnBucket.Name,
			Domain:     pulumi.String("cdn.datti.app"),
			ZoneId:     pulumi.String(zoneID),
			Enabled:    pulumi.Bool(true),
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

		// Pages: datti.app をフロントの本番ドメインとしてバインド
		_, err = cloudflare.NewPagesDomain(ctx, "frontend-domain", &cloudflare.PagesDomainArgs{
			AccountId:   pulumi.String(accountID),
			ProjectName: pagesProject.Name,
			Name:        pulumi.String("datti.app"),
		})
		if err != nil {
			return err
		}

		ctx.Export("cdnBucketName", cdnBucket.Name)
		ctx.Export("pagesProjectName", pagesProject.Name)
		ctx.Export("pagesProjectSubdomain", pagesProject.Subdomain)
		return nil
	})
}
