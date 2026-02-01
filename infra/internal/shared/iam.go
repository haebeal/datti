package shared

import (
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

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
