package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi-cloudflare/sdk/v5/go/cloudflare"
	"github.com/pulumi/pulumi-random/sdk/v4/go/random"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func createCloudflareResources(ctx *pulumi.Context) error {
	accountID := "4f5e10c2fb5822e544334c6d9325fc2b"
	zoneID := "80a6bee1a62e55ee44c2bb675e24eabf"

	// Tunnelシークレットを生成
	tunnelSecret, err := random.NewRandomId(ctx, "datti-tunnel-secret", &random.RandomIdArgs{
		ByteLength: pulumi.Int(32),
	})
	if err != nil {
		return err
	}

	// Tunnel作成
	tunnel, err := cloudflare.NewZeroTrustTunnelCloudflared(ctx, "datti-tunnel", &cloudflare.ZeroTrustTunnelCloudflaredArgs{
		AccountId: pulumi.String(accountID),
		Name:      pulumi.String("datti-tunnel"),
		Secret:    tunnelSecret.B64Std,
	})
	if err != nil {
		return err
	}

	// Tunnel設定
	_, err = cloudflare.NewZeroTrustTunnelCloudflaredConfig(ctx, "datti-tunnel-config", &cloudflare.ZeroTrustTunnelCloudflaredConfigArgs{
		AccountId: pulumi.String(accountID),
		TunnelId:  tunnel.ID(),
		Config: &cloudflare.ZeroTrustTunnelCloudflaredConfigConfigArgs{
			IngressRules: cloudflare.ZeroTrustTunnelCloudflaredConfigConfigIngressRuleArray{
				&cloudflare.ZeroTrustTunnelCloudflaredConfigConfigIngressRuleArgs{
					Hostname: pulumi.String("dev.datti.app"),
					Service:  pulumi.String("http://localhost:3000"),
				},
				&cloudflare.ZeroTrustTunnelCloudflaredConfigConfigIngressRuleArgs{
					Service: pulumi.String("http_status:404"),
				},
			},
		},
	})
	if err != nil {
		return err
	}

	// DNSレコード
	_, err = cloudflare.NewRecord(ctx, "dev-datti-dns", &cloudflare.RecordArgs{
		ZoneId:  pulumi.String(zoneID),
		Name:    pulumi.String("dev"),
		Type:    pulumi.String("CNAME"),
		Content: tunnel.Cname,
		Proxied: pulumi.Bool(true),
	})
	if err != nil {
		return err
	}

	// cloudflaredトークンをSSMに保存
	_, err = ssm.NewParameter(ctx, "/datti/cloudflared/token", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/cloudflared/token"),
		Type:  pulumi.String("SecureString"),
		Value: tunnel.TunnelToken,
	})
	if err != nil {
		return err
	}

	return nil
}
