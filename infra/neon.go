package main

import (
	"github.com/pulumi/pulumi-terraform-provider/sdks/go/neon/neon"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func createNeon(ctx *pulumi.Context) error {
	_, err := neon.NewProject(ctx, "datti", &neon.ProjectArgs{
		Branch: &neon.ProjectBranchArgs{
			DatabaseName: pulumi.String("neondb"),
			Name:         pulumi.String("prod"),
			RoleName:     pulumi.String("neondb_owner"),
		},
		ComputeProvisioner: pulumi.String("k8s-neonvm"),
		DefaultEndpointSettings: &neon.ProjectDefaultEndpointSettingsArgs{
			AutoscalingLimitMaxCu: pulumi.Float64(2),
			AutoscalingLimitMinCu: pulumi.Float64(0.25),
		},
		HistoryRetentionSeconds: pulumi.Float64(86400),
		MaintenanceWindow: &neon.ProjectMaintenanceWindowArgs{
			EndTime:   pulumi.String("19:00"),
			StartTime: pulumi.String("18:00"),
			Weekdays: pulumi.Float64Array{
				pulumi.Float64(2),
			},
		},
		Name:          pulumi.String("Datti"),
		OrgId:         pulumi.String("org-frosty-mountain-46580130"),
		PgVersion:     pulumi.Float64(17),
		RegionId:      pulumi.String("aws-ap-southeast-1"),
		StorePassword: pulumi.String("yes"),
	}, pulumi.Protect(true))
	if err != nil {
		return err
	}

	_, err = neon.NewBranch(ctx, "neon-branch-dev", &neon.BranchArgs{
		Name:            pulumi.String("dev"),
		ParentId:        pulumi.String("br-polished-bonus-a10yscty"),
		ParentLsn:       pulumi.String("0/1F79328"),
		ParentTimestamp: pulumi.Float64(1755787436),
		ProjectId:       pulumi.String("quiet-wildflower-78644609"),
	}, pulumi.Protect(true))
	if err != nil {
		return err
	}

	return nil
}
