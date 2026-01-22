package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi-terraform-provider/sdks/go/neon/neon"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func createNeonResources(ctx *pulumi.Context) error {
	project, err := neon.NewProject(ctx, "datti-neon", &neon.ProjectArgs{
		Name:                    pulumi.String("datti"),
		OrgId:                   pulumi.String("org-frosty-mountain-46580130"),
		RegionId:                pulumi.String("aws-ap-southeast-1"),
		PgVersion:               pulumi.Float64(17),
		HistoryRetentionSeconds: pulumi.Float64(21600), // 無料枠上限: 6時間
		Branch: &neon.ProjectBranchArgs{
			Name:         pulumi.String("prod"),
			DatabaseName: pulumi.String("neondb"),
			RoleName:     pulumi.String("neondb_owner"),
		},
	})
	if err != nil {
		return err
	}

	_, err = ssm.NewParameter(ctx, "datti-dev-dsn", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/dev/backend/DSN"),
		Type:  pulumi.String("SecureString"),
		Value: project.ConnectionUri,
	})
	if err != nil {
		return err
	}

	return nil
}
