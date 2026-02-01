package env

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsssm"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type StackProps struct {
	awscdk.StackProps
	Env                string // "dev" or "prod"
	GoogleClientID     string
	GoogleClientSecret string
}

// NewStack は環境別リソースを持つスタックを作成
func NewStack(scope constructs.Construct, id string, props *StackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)
	env := props.Env

	// Cognito
	cognito := newCognito(stack, env, &cognitoProps{
		GoogleClientID:     props.GoogleClientID,
		GoogleClientSecret: props.GoogleClientSecret,
	})

	// DynamoDB
	dynamoDB := newDynamoDB(stack, env)

	// S3 + CloudFront
	s3 := newS3(stack, env)

	// ECS Roles and Log Groups
	ecs := newECS(stack, env)

	// Grant DynamoDB access to task role
	dynamoDB.SessionsTable.GrantReadWriteData(ecs.TaskRole)

	// Grant S3 access to task role
	s3.AvatarBucket.GrantReadWrite(ecs.TaskRole, jsii.String("avatars/*"))

	// SSM Parameters
	cognitoDomainURL := fmt.Sprintf("https://%s.auth.ap-northeast-1.amazoncognito.com", *cognito.UserPoolDomain.DomainName())

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoUserPoolIdParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/COGNITO_USER_POOL_ID", env)),
		StringValue:   cognito.UserPool.UserPoolId(),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoClientIdParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/COGNITO_CLIENT_ID", env)),
		StringValue:   cognito.UserPoolClient.UserPoolClientId(),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoDomainParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/COGNITO_DOMAIN", env)),
		StringValue:   jsii.String(cognitoDomainURL),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoIssuerParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/COGNITO_ISSUER", env)),
		StringValue:   jsii.String(fmt.Sprintf("https://cognito-idp.ap-northeast-1.amazonaws.com/%s", *cognito.UserPool.UserPoolId())),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiPostgresDsnParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/backend/POSTGRES_DSN", env)),
		StringValue:   jsii.String("CHANGE_ME"),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiCloudflaredTokenParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/cloudflared/token", env)),
		StringValue:   jsii.String("CHANGE_ME"),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiS3AvatarBucketParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/S3_AVATAR_BUCKET", env)),
		StringValue:   s3.AvatarBucket.BucketName(),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiAvatarBaseUrlParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String(fmt.Sprintf("/datti/%s/AVATAR_BASE_URL", env)),
		StringValue:   jsii.String(fmt.Sprintf("https://%s", *s3.AvatarDistribution.DistributionDomainName())),
	})

	// Outputs
	awscdk.NewCfnOutput(stack, jsii.String("ExecutionRoleArn"), &awscdk.CfnOutputProps{
		Value: ecs.ExecutionRole.RoleArn(),
	})
	awscdk.NewCfnOutput(stack, jsii.String("TaskRoleArn"), &awscdk.CfnOutputProps{
		Value: ecs.TaskRole.RoleArn(),
	})

	return stack
}
