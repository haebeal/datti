package shared

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type StackProps struct {
	awscdk.StackProps
}

// NewStack は環境横断で1個あれば足りるリソース (GitHub OIDC Role) を持つスタックを作成する。
// バックエンドが Cloudflare Containers に移行したため、VPC / ECS / ECR はすべて廃止済み。
func NewStack(scope constructs.Construct, id string, props *StackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	// GitHub Actions Role (OIDC) — CDK デプロイ自身に必要なので残す
	githubRole := newGitHubActionsRole(stack)

	awscdk.NewCfnOutput(stack, jsii.String("GitHubActionsRoleArn"), &awscdk.CfnOutputProps{
		Value:      githubRole.RoleArn(),
		ExportName: jsii.String("DattiGitHubActionsRoleArn"),
	})

	return stack
}
