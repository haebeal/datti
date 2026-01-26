package aws

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func CreateAWSResources(ctx *pulumi.Context) error {
	callerIdentity, err := aws.GetCallerIdentity(ctx, nil)
	if err != nil {
		return err
	}
	accountID := callerIdentity.AccountId
	region := "ap-northeast-1"

	// SSM Parameter ARNを組み立てるヘルパー
	ssmARN := func(path string) pulumi.String {
		return pulumi.String(fmt.Sprintf("arn:aws:ssm:%s:%s:parameter%s", region, accountID, path))
	}

	network, err := createNetworkResources(ctx)
	if err != nil {
		return err
	}

	ecr, err := createECR(ctx)
	if err != nil {
		return err
	}

	cognito, err := createCognito(ctx)
	if err != nil {
		return err
	}

	dynamoDB, err := createDynamoDB(ctx)
	if err != nil {
		return err
	}

	// DSN用のSSMパラメータ（値は手動で設定）
	_, err = ssm.NewParameter(ctx, "datti-dev-dsn", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/dev/backend/DSN"),
		Type:  pulumi.String("SecureString"),
		Value: pulumi.String("CHANGE_ME"),
	}, pulumi.IgnoreChanges([]string{"value"}))
	if err != nil {
		return err
	}

	// Cloudflaredトークン用のSSMパラメータ（値は手動で設定）
	_, err = ssm.NewParameter(ctx, "datti-cloudflared-token", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/cloudflared/token"),
		Type:  pulumi.String("SecureString"),
		Value: pulumi.String("CHANGE_ME"),
	}, pulumi.IgnoreChanges([]string{"value"}))
	if err != nil {
		return err
	}

	if err = createECS(ctx, ecsConfig{
		subnetID:            network.subnetID,
		securityGroupID:     network.sgID,
		backendRepoURL:      ecr.backendRepoURL,
		frontendRepoURL:     ecr.frontendRepoURL,
		dsnARN:              ssmARN("/datti/dev/backend/DSN"),
		cloudflaredTokenARN: ssmARN("/datti/cloudflared/token"),
		cognitoDomainARN:    cognito.cognitoDomainARN,
		cognitoClientIDARN:  cognito.cognitoClientIDARN,
		sessionsTableName:   dynamoDB.sessionsTableName,
		sessionsTableARN:    dynamoDB.sessionsTableARN,
	}); err != nil {
		return err
	}

	return nil
}
