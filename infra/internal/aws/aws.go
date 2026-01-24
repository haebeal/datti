package aws

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func CreateAWSResources(ctx *pulumi.Context) error {
	callerIdentity, err := aws.GetCallerIdentity(ctx, nil)
	if err != nil {
		return err
	}
	accountID := callerIdentity.AccountId
	region := "ap-northeast-1"

	network, err := createNetworkResources(ctx)
	if err != nil {
		return err
	}

	if err := createECR(ctx); err != nil {
		return err
	}

	if err = createCognito(ctx); err != nil {
		return err
	}

	if err = createECS(ctx, network.subnetID, network.sgID, region, accountID); err != nil {
		return err
	}

	return nil
}
