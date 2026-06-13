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
	LineChannelID      string
	LineChannelSecret  string
}

// NewStack は環境別リソース (現状: Cognito のみ) を持つスタックを作成する。
// バックエンドは Cloudflare Containers、フロントは Cloudflare Pages、
// アバター画像は R2 に移行済みのため、CDK で管理する AWS リソースは Cognito だけになった。
func NewStack(scope constructs.Construct, id string, props *StackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)
	env := props.Env

	cognito := newCognito(stack, env, &cognitoProps{
		GoogleClientID:     props.GoogleClientID,
		GoogleClientSecret: props.GoogleClientSecret,
		LineChannelID:      props.LineChannelID,
		LineChannelSecret:  props.LineChannelSecret,
	})

	// Cognito 値の参照用に SSM Parameter Store にも書き出す
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

	// Outputs (Cloudflare 側に登録するために参照する)
	awscdk.NewCfnOutput(stack, jsii.String("CognitoUserPoolId"), &awscdk.CfnOutputProps{
		Value: cognito.UserPool.UserPoolId(),
	})
	awscdk.NewCfnOutput(stack, jsii.String("CognitoClientId"), &awscdk.CfnOutputProps{
		Value: cognito.UserPoolClient.UserPoolClientId(),
	})
	awscdk.NewCfnOutput(stack, jsii.String("CognitoDomain"), &awscdk.CfnOutputProps{
		Value: jsii.String(cognitoDomainURL),
	})

	return stack
}
