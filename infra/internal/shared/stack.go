package shared

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecr"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecs"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type StackProps struct {
	awscdk.StackProps
}

// Outputs は他のスタックから参照するための出力
type Outputs struct {
	Vpc               awsec2.IVpc
	SecurityGroup     awsec2.ISecurityGroup
	EcsCluster        awsecs.ICluster
	BackendRepo       awsecr.IRepository
	FrontendRepo      awsecr.IRepository
	GitHubActionsRole awsiam.IRole
}

// NewStack は共有リソースを持つスタックを作成
func NewStack(scope constructs.Construct, id string, props *StackProps) (awscdk.Stack, *Outputs) {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	// Network (VPC, Security Group)
	network := newNetwork(stack)

	// ECR Repositories
	ecr := newECR(stack)

	// ECS Cluster
	cluster := newECSCluster(stack, network.Vpc, network.SecurityGroup)

	// GitHub Actions Role (OIDC)
	githubRole := newGitHubActionsRole(stack)

	// Outputs
	awscdk.NewCfnOutput(stack, jsii.String("VpcId"), &awscdk.CfnOutputProps{
		Value:      network.Vpc.VpcId(),
		ExportName: jsii.String("DattiVpcId"),
	})
	awscdk.NewCfnOutput(stack, jsii.String("SecurityGroupId"), &awscdk.CfnOutputProps{
		Value:      network.SecurityGroup.SecurityGroupId(),
		ExportName: jsii.String("DattiSecurityGroupId"),
	})
	awscdk.NewCfnOutput(stack, jsii.String("EcsClusterName"), &awscdk.CfnOutputProps{
		Value:      cluster.ClusterName(),
		ExportName: jsii.String("DattiEcsClusterName"),
	})
	awscdk.NewCfnOutput(stack, jsii.String("EcsClusterArn"), &awscdk.CfnOutputProps{
		Value:      cluster.ClusterArn(),
		ExportName: jsii.String("DattiEcsClusterArn"),
	})
	awscdk.NewCfnOutput(stack, jsii.String("BackendRepoUri"), &awscdk.CfnOutputProps{
		Value:      ecr.BackendRepo.RepositoryUri(),
		ExportName: jsii.String("DattiBackendRepoUri"),
	})
	awscdk.NewCfnOutput(stack, jsii.String("FrontendRepoUri"), &awscdk.CfnOutputProps{
		Value:      ecr.FrontendRepo.RepositoryUri(),
		ExportName: jsii.String("DattiFrontendRepoUri"),
	})
	awscdk.NewCfnOutput(stack, jsii.String("GitHubActionsRoleArn"), &awscdk.CfnOutputProps{
		Value:      githubRole.RoleArn(),
		ExportName: jsii.String("DattiGitHubActionsRoleArn"),
	})

	return stack, &Outputs{
		Vpc:               network.Vpc,
		SecurityGroup:     network.SecurityGroup,
		EcsCluster:        cluster,
		BackendRepo:       ecr.BackendRepo,
		FrontendRepo:      ecr.FrontendRepo,
		GitHubActionsRole: githubRole,
	}
}
