package shared

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

// IAMResources はIAMリソースを保持
type IAMResources struct {
	GitHubActionsRole awsiam.IRole
	AdminRole         awsiam.IRole
	BillingRole       awsiam.IRole
	DeveloperRole     awsiam.IRole
	AdminGroup        awsiam.IGroup
	DeveloperGroup    awsiam.IGroup
}

func newIAM(scope constructs.Construct) *IAMResources {
	// GitHub Actions Role
	githubRole := newGitHubActionsRole(scope)

	// Human user roles
	adminRole := newAdminRole(scope)
	billingRole := newBillingRole(scope)
	developerRole := newDeveloperRole(scope)

	// IAM Groups
	adminGroup := newAdminGroup(scope, adminRole, billingRole, developerRole)
	developerGroup := newDeveloperGroup(scope, developerRole)

	return &IAMResources{
		GitHubActionsRole: githubRole,
		AdminRole:         adminRole,
		BillingRole:       billingRole,
		DeveloperRole:     developerRole,
		AdminGroup:        adminGroup,
		DeveloperGroup:    developerGroup,
	}
}

func newGitHubActionsRole(scope constructs.Construct) awsiam.IRole {
	// GitHub OIDC Provider
	oidcProvider := awsiam.NewOpenIdConnectProvider(scope, jsii.String("DattiGitHubOidcProvider"), &awsiam.OpenIdConnectProviderProps{
		Url: jsii.String("https://token.actions.githubusercontent.com"),
		ClientIds: &[]*string{
			jsii.String("sts.amazonaws.com"),
		},
		Thumbprints: &[]*string{
			jsii.String("6938fd4d98bab03faadb97b34396831e3780aea1"),
			jsii.String("1c58a3a8518e8759bf075b76b750d4f2df264fcd"),
		},
	})

	// Trust policy for GitHub Actions
	principal := awsiam.NewFederatedPrincipal(
		oidcProvider.OpenIdConnectProviderArn(),
		&map[string]any{
			"StringEquals": map[string]string{
				"token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
			},
			"StringLike": map[string]string{
				"token.actions.githubusercontent.com:sub": "repo:haebeal/datti:*",
			},
		},
		jsii.String("sts:AssumeRoleWithWebIdentity"),
	)

	// IAM Role for GitHub Actions
	role := awsiam.NewRole(scope, jsii.String("DattiGitHubActionsRole"), &awsiam.RoleProps{
		RoleName:  jsii.String("datti-github-actions-role"),
		AssumedBy: principal,
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AdministratorAccess")),
		},
	})

	return role
}

// newAdminRole は管理者用ロールを作成
func newAdminRole(scope constructs.Construct) awsiam.IRole {
	accountID := awscdk.Aws_ACCOUNT_ID()

	role := awsiam.NewRole(scope, jsii.String("DattiAdminRole"), &awsiam.RoleProps{
		RoleName:  jsii.String("datti-admin-role"),
		AssumedBy: awsiam.NewAccountPrincipal(accountID),
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			// IAM管理
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("IAMFullAccess")),
			// Billing
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("job-function/Billing")),
			// 読取アクセス
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("ReadOnlyAccess")),
		},
	})

	// インフラ変更権限（CDK/CloudFormation, ECS, ECR, etc.）
	role.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("InfrastructureManagement"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			// CloudFormation / CDK
			jsii.String("cloudformation:*"),
			// ECS
			jsii.String("ecs:*"),
			// ECR
			jsii.String("ecr:*"),
			// S3
			jsii.String("s3:*"),
			// DynamoDB
			jsii.String("dynamodb:*"),
			// Cognito
			jsii.String("cognito-idp:*"),
			// SSM
			jsii.String("ssm:*"),
			// CloudWatch
			jsii.String("logs:*"),
			jsii.String("cloudwatch:*"),
			// Lambda
			jsii.String("lambda:*"),
			// VPC / Network
			jsii.String("ec2:*"),
			// CloudFront
			jsii.String("cloudfront:*"),
			// Route53
			jsii.String("route53:*"),
			// ACM
			jsii.String("acm:*"),
			// STS（AssumeRole）
			jsii.String("sts:*"),
		},
		Resources: &[]*string{jsii.String("*")},
	}))

	return role
}

// newBillingRole は請求確認用ロールを作成
func newBillingRole(scope constructs.Construct) awsiam.IRole {
	accountID := awscdk.Aws_ACCOUNT_ID()

	role := awsiam.NewRole(scope, jsii.String("DattiBillingRole"), &awsiam.RoleProps{
		RoleName:  jsii.String("datti-billing-role"),
		AssumedBy: awsiam.NewAccountPrincipal(accountID),
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("job-function/Billing")),
		},
	})

	// Cost Explorer
	role.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("CostExplorerAccess"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			jsii.String("ce:*"),
			jsii.String("budgets:View*"),
		},
		Resources: &[]*string{jsii.String("*")},
	}))

	return role
}

// newDeveloperRole は開発者用ロールを作成
func newDeveloperRole(scope constructs.Construct) awsiam.IRole {
	accountID := awscdk.Aws_ACCOUNT_ID()

	role := awsiam.NewRole(scope, jsii.String("DattiDeveloperRole"), &awsiam.RoleProps{
		RoleName:  jsii.String("datti-developer-role"),
		AssumedBy: awsiam.NewAccountPrincipal(accountID),
	})

	// CloudWatch Logs 読取
	role.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("CloudWatchLogsRead"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			jsii.String("logs:DescribeLogGroups"),
			jsii.String("logs:DescribeLogStreams"),
			jsii.String("logs:GetLogEvents"),
			jsii.String("logs:FilterLogEvents"),
			jsii.String("logs:StartQuery"),
			jsii.String("logs:StopQuery"),
			jsii.String("logs:GetQueryResults"),
		},
		Resources: &[]*string{jsii.String("*")},
	}))

	// ECS Exec + DescribeS
	role.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("ECSAccess"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			jsii.String("ecs:DescribeServices"),
			jsii.String("ecs:DescribeTasks"),
			jsii.String("ecs:DescribeClusters"),
			jsii.String("ecs:ListServices"),
			jsii.String("ecs:ListTasks"),
			jsii.String("ecs:ExecuteCommand"),
		},
		Resources: &[]*string{jsii.String("*")},
	}))

	// SSM (ECS Exec用 + Parameter Store読み書き)
	role.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("SSMAccess"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			// ECS Exec用
			jsii.String("ssmmessages:CreateControlChannel"),
			jsii.String("ssmmessages:CreateDataChannel"),
			jsii.String("ssmmessages:OpenControlChannel"),
			jsii.String("ssmmessages:OpenDataChannel"),
			// Parameter Store 読み書き
			jsii.String("ssm:GetParameter"),
			jsii.String("ssm:GetParameters"),
			jsii.String("ssm:GetParametersByPath"),
			jsii.String("ssm:PutParameter"),
			jsii.String("ssm:DeleteParameter"),
			jsii.String("ssm:DescribeParameters"),
		},
		Resources: &[]*string{jsii.String("*")},
	}))

	// DynamoDB: datti-sessions のみ
	role.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("DynamoDBSessionsAccess"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			jsii.String("dynamodb:GetItem"),
			jsii.String("dynamodb:PutItem"),
			jsii.String("dynamodb:UpdateItem"),
			jsii.String("dynamodb:DeleteItem"),
			jsii.String("dynamodb:Query"),
			jsii.String("dynamodb:Scan"),
			jsii.String("dynamodb:BatchGetItem"),
			jsii.String("dynamodb:BatchWriteItem"),
		},
		Resources: &[]*string{
			jsii.String(fmt.Sprintf("arn:aws:dynamodb:*:%s:table/*-datti-sessions", *accountID)),
			jsii.String(fmt.Sprintf("arn:aws:dynamodb:*:%s:table/*-datti-sessions/index/*", *accountID)),
		},
	}))

	// S3: avatar バケットのみ
	role.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("S3AvatarAccess"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			jsii.String("s3:GetObject"),
			jsii.String("s3:PutObject"),
			jsii.String("s3:DeleteObject"),
			jsii.String("s3:ListBucket"),
		},
		Resources: &[]*string{
			jsii.String(fmt.Sprintf("arn:aws:s3:::*-datti-avatar")),
			jsii.String(fmt.Sprintf("arn:aws:s3:::*-datti-avatar/*")),
		},
	}))

	// ECR: イメージ一覧
	role.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("ECRReadAccess"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			jsii.String("ecr:DescribeRepositories"),
			jsii.String("ecr:DescribeImages"),
			jsii.String("ecr:ListImages"),
			jsii.String("ecr:GetAuthorizationToken"),
		},
		Resources: &[]*string{jsii.String("*")},
	}))

	// Cognito: 読取 + ユーザー有効/無効化
	role.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("CognitoAccess"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			// 読取系（AmazonCognitoReadOnly相当）
			jsii.String("cognito-idp:Describe*"),
			jsii.String("cognito-idp:List*"),
			jsii.String("cognito-idp:Get*"),
			jsii.String("cognito-idp:AdminGetUser"),
			jsii.String("cognito-idp:AdminListGroupsForUser"),
			jsii.String("cognito-idp:AdminListUserAuthEvents"),
			// ユーザー有効/無効化
			jsii.String("cognito-idp:AdminDisableUser"),
			jsii.String("cognito-idp:AdminEnableUser"),
		},
		Resources: &[]*string{jsii.String("*")},
	}))

	return role
}

// newAdminGroup は管理者グループを作成
func newAdminGroup(scope constructs.Construct, adminRole, billingRole, developerRole awsiam.IRole) awsiam.IGroup {
	group := awsiam.NewGroup(scope, jsii.String("DattiAdministratorsGroup"), &awsiam.GroupProps{
		GroupName: jsii.String("datti-administrators"),
	})

	// 全ロールへのAssumeRole権限を付与
	group.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("AssumeRoles"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			jsii.String("sts:AssumeRole"),
		},
		Resources: &[]*string{
			adminRole.RoleArn(),
			billingRole.RoleArn(),
			developerRole.RoleArn(),
		},
	}))

	return group
}

// newDeveloperGroup は開発者グループを作成
func newDeveloperGroup(scope constructs.Construct, developerRole awsiam.IRole) awsiam.IGroup {
	group := awsiam.NewGroup(scope, jsii.String("DattiDevelopersGroup"), &awsiam.GroupProps{
		GroupName: jsii.String("datti-developers"),
	})

	// DeveloperRoleへのAssumeRole権限のみ
	group.AddToPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Sid:    jsii.String("AssumeRole"),
		Effect: awsiam.Effect_ALLOW,
		Actions: &[]*string{
			jsii.String("sts:AssumeRole"),
		},
		Resources: &[]*string{
			developerRole.RoleArn(),
		},
	}))

	return group
}
