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
	GoogleClientID     string
	GoogleClientSecret string
	LineChannelID      string
	LineChannelSecret  string
}

// NewStack は本番リソース (Cognito) を持つスタックを作成する。
// dev 環境は廃止しローカル開発は localhost のみ。
func NewStack(scope constructs.Construct, id string, props *StackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	cognito := newCognito(stack, &cognitoProps{
		GoogleClientID:     props.GoogleClientID,
		GoogleClientSecret: props.GoogleClientSecret,
		LineChannelID:      props.LineChannelID,
		LineChannelSecret:  props.LineChannelSecret,
	})

	cognitoDomainURL := fmt.Sprintf("https://%s.auth.ap-northeast-1.amazoncognito.com", *cognito.UserPoolDomain.DomainName())

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoUserPoolIdParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String("/datti/COGNITO_USER_POOL_ID"),
		StringValue:   cognito.UserPool.UserPoolId(),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoClientIdParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String("/datti/COGNITO_CLIENT_ID"),
		StringValue:   cognito.UserPoolClient.UserPoolClientId(),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoDomainParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String("/datti/COGNITO_DOMAIN"),
		StringValue:   jsii.String(cognitoDomainURL),
	})

	awsssm.NewStringParameter(stack, jsii.String("DattiCognitoIssuerParam"), &awsssm.StringParameterProps{
		ParameterName: jsii.String("/datti/COGNITO_ISSUER"),
		StringValue:   jsii.String(fmt.Sprintf("https://cognito-idp.ap-northeast-1.amazonaws.com/%s", *cognito.UserPool.UserPoolId())),
	})

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
