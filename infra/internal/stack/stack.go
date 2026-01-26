package stack

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsssm"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type DattiStackProps struct {
	awscdk.StackProps
	Env                string // "dev" or "prod"
	GoogleClientID     string
	GoogleClientSecret string
}

func NewDattiStack(scope constructs.Construct, id string, props *DattiStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)
	env := props.Env

	// Network
	network := newNetwork(stack, env)

	// ECR
	ecr := newECR(stack, env)

	// Cognito
	cognito := newCognito(stack, env, &cognitoProps{
		GoogleClientID:     props.GoogleClientID,
		GoogleClientSecret: props.GoogleClientSecret,
	})

	// DynamoDB
	dynamoDB := newDynamoDB(stack, env)

	// SSM Parameters
	cognitoDomainURL := fmt.Sprintf("https://%s.auth.ap-northeast-1.amazoncognito.com", *cognito.UserPoolDomain.DomainName())

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoUserPoolIdParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/COGNITO_USER_POOL_ID", env)),
		StringValue:   cognito.UserPool.UserPoolId(),
	})

	cognitoClientIDParam := awsssm.NewStringParameter(stack, jsii.String("DattiCognitoClientIdParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/COGNITO_CLIENT_ID", env)),
		StringValue:   cognito.UserPoolClient.UserPoolClientId(),
	})

	cognitoDomainParam := awsssm.NewStringParameter(stack, jsii.String("DattiCognitoDomainParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/COGNITO_DOMAIN", env)),
		StringValue:   jsii.String(cognitoDomainURL),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoIssuerParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/COGNITO_ISSUER", env)),
		StringValue:   jsii.String(fmt.Sprintf("https://cognito-idp.ap-northeast-1.amazonaws.com/%s", *cognito.UserPool.UserPoolId())),
	})

	dsnParam := awsssm.NewStringParameter(stack, jsii.String("DattiDsnParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/backend/DSN", env)),
		StringValue:   jsii.String("CHANGE_ME"),
	})

	cloudflaredTokenParam := awsssm.NewStringParameter(stack, jsii.String("DattiCloudflaredTokenParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/cloudflared/token", env)),
		StringValue:   jsii.String("CHANGE_ME"),
	})

	// ECS
	newECS(stack, env, &ecsProps{
		Vpc:                   network.Vpc,
		SecurityGroup:         network.SecurityGroup,
		BackendRepo:           ecr.BackendRepo,
		FrontendRepo:          ecr.FrontendRepo,
		SessionsTable:         dynamoDB.SessionsTable,
		DsnParam:              dsnParam,
		CognitoDomainParam:    cognitoDomainParam,
		CognitoClientIDParam:  cognitoClientIDParam,
		CloudflaredTokenParam: cloudflaredTokenParam,
	})

	// GitHub Actions Role
	githubRole := newGitHubActionsRole(stack, env)

	// Outputs
	awscdk.NewCfnOutput(stack, jsii.String("DattiBackendRepoUri"), &awscdk.CfnOutputProps{
		Value: ecr.BackendRepo.RepositoryUri(),
	})
	awscdk.NewCfnOutput(stack, jsii.String("DattiFrontendRepoUri"), &awscdk.CfnOutputProps{
		Value: ecr.FrontendRepo.RepositoryUri(),
	})
	awscdk.NewCfnOutput(stack, jsii.String("DattiGitHubActionsRoleArn"), &awscdk.CfnOutputProps{
		Value: githubRole.RoleArn(),
	})

	return stack
}
