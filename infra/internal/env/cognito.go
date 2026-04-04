package env

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscognito"
	awslambdago "github.com/aws/aws-cdk-go/awscdklambdagoalpha/v2"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type CognitoResources struct {
	UserPool       awscognito.IUserPool
	UserPoolClient awscognito.IUserPoolClient
	UserPoolDomain awscognito.IUserPoolDomain
}

type cognitoProps struct {
	GoogleClientID     string
	GoogleClientSecret string
	LineChannelID      string
	LineChannelSecret  string
}

func newCognito(scope constructs.Construct, env string, props *cognitoProps) *CognitoResources {
	userPool := awscognito.NewUserPool(scope, jsii.String("DattiUserPool"), &awscognito.UserPoolProps{
		UserPoolName: jsii.String(fmt.Sprintf("%s-datti-user-pool", env)),
		SignInAliases: &awscognito.SignInAliases{
			Email: jsii.Bool(true),
		},
		AutoVerify: &awscognito.AutoVerifiedAttrs{
			Email: jsii.Bool(true),
		},
		PasswordPolicy: &awscognito.PasswordPolicy{
			MinLength:        jsii.Number(8),
			RequireLowercase: jsii.Bool(false),
			RequireUppercase: jsii.Bool(false),
			RequireDigits:    jsii.Bool(false),
			RequireSymbols:   jsii.Bool(false),
		},
		AccountRecovery: awscognito.AccountRecovery_EMAIL_ONLY,
		RemovalPolicy:   awscdk.RemovalPolicy_DESTROY,
	})

	// Pre Sign-up Lambda（メールベース自動アカウントリンク）
	preSignUpFn := awslambdago.NewGoFunction(scope, jsii.String("DattiPreSignUpFunction"), &awslambdago.GoFunctionProps{
		FunctionName: jsii.String(fmt.Sprintf("%s-datti-pre-signup", env)),
		Entry:        jsii.String("../lambda/pre-signup"),
	})
	userPool.Grant(preSignUpFn, jsii.String("cognito-idp:ListUsers"), jsii.String("cognito-idp:AdminLinkProviderForUser"))
	userPool.AddTrigger(awscognito.UserPoolOperation_PRE_SIGN_UP(), preSignUpFn, awscognito.LambdaVersion_V1_0)

	userPoolDomain := userPool.AddDomain(jsii.String("DattiUserPoolDomain"), &awscognito.UserPoolDomainOptions{
		CognitoDomain: &awscognito.CognitoDomainOptions{
			DomainPrefix: jsii.String(fmt.Sprintf("%s-datti", env)),
		},
	})

	// Callback/Logout URLs based on environment
	var callbackURLs, logoutURLs *[]*string
	if env == "prod" {
		callbackURLs = jsii.Strings("https://datti.app/api/auth/cognito/callback")
		logoutURLs = jsii.Strings("https://datti.app/auth")
	} else {
		callbackURLs = jsii.Strings(
			fmt.Sprintf("https://%s.datti.app/api/auth/cognito/callback", env),
			"http://localhost:3000/api/auth/cognito/callback",
		)
		logoutURLs = jsii.Strings(
			fmt.Sprintf("https://%s.datti.app/auth", env),
			"http://localhost:3000/auth",
		)
	}

	lineIdp := awscognito.NewUserPoolIdentityProviderOidc(scope, jsii.String("DattiLineIdp"), &awscognito.UserPoolIdentityProviderOidcProps{
		UserPool:     userPool,
		ClientId:     jsii.String(props.LineChannelID),
		ClientSecret: jsii.String(props.LineChannelSecret),
		IssuerUrl:    jsii.String("https://access.line.me"),
		Endpoints: &awscognito.OidcEndpoints{
			Authorization: jsii.String("https://access.line.me/oauth2/v2.1/authorize"),
			Token:         jsii.String("https://api.line.me/oauth2/v2.1/token"),
			UserInfo:      jsii.String("https://api.line.me/v2/profile"),
			JwksUri:       jsii.String("https://api.line.me/oauth2/v2.1/certs"),
		},
		Scopes:                 jsii.Strings("openid", "profile", "email"),
		Name:                   jsii.String("LINE"),
		AttributeRequestMethod: awscognito.OidcAttributeRequestMethod_GET,
		AttributeMapping: &awscognito.AttributeMapping{
			Email:          awscognito.ProviderAttribute_Other(jsii.String("email")),
			Fullname:       awscognito.ProviderAttribute_Other(jsii.String("name")),
			ProfilePicture: awscognito.ProviderAttribute_Other(jsii.String("picture")),
		},
	})

	googleIdp := awscognito.NewUserPoolIdentityProviderGoogle(scope, jsii.String("DattiGoogleIdp"), &awscognito.UserPoolIdentityProviderGoogleProps{
		UserPool:          userPool,
		ClientId:          jsii.String(props.GoogleClientID),
		ClientSecretValue: awscdk.SecretValue_UnsafePlainText(jsii.String(props.GoogleClientSecret)),
		Scopes:            jsii.Strings("openid", "email", "profile"),
		AttributeMapping: &awscognito.AttributeMapping{
			Email:          awscognito.ProviderAttribute_GOOGLE_EMAIL(),
			Fullname:       awscognito.ProviderAttribute_GOOGLE_NAME(),
			ProfilePicture: awscognito.ProviderAttribute_GOOGLE_PICTURE(),
		},
	})

	userPoolClient := userPool.AddClient(jsii.String("DattiUserPoolClient"), &awscognito.UserPoolClientOptions{
		UserPoolClientName: jsii.String(fmt.Sprintf("%s-datti-frontend", env)),
		OAuth: &awscognito.OAuthSettings{
			Flows: &awscognito.OAuthFlows{
				AuthorizationCodeGrant: jsii.Bool(true),
			},
			Scopes: &[]awscognito.OAuthScope{
				awscognito.OAuthScope_OPENID(),
				awscognito.OAuthScope_EMAIL(),
				awscognito.OAuthScope_PROFILE(),
				awscognito.OAuthScope_COGNITO_ADMIN(),
			},
			CallbackUrls: callbackURLs,
			LogoutUrls:   logoutURLs,
		},
		SupportedIdentityProviders: &[]awscognito.UserPoolClientIdentityProvider{
			awscognito.UserPoolClientIdentityProvider_GOOGLE(),
			awscognito.UserPoolClientIdentityProvider_Custom(jsii.String("LINE")),
		},
		AccessTokenValidity:  awscdk.Duration_Hours(jsii.Number(1)),
		IdTokenValidity:      awscdk.Duration_Hours(jsii.Number(1)),
		RefreshTokenValidity: awscdk.Duration_Days(jsii.Number(30)),
	})
	userPoolClient.Node().AddDependency(googleIdp)
	userPoolClient.Node().AddDependency(lineIdp)

	return &CognitoResources{
		UserPool:       userPool,
		UserPoolClient: userPoolClient,
		UserPoolDomain: userPoolDomain,
	}
}
