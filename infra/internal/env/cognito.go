package env

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscognito"
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

	userPoolDomain := userPool.AddDomain(jsii.String("DattiUserPoolDomain"), &awscognito.UserPoolDomainOptions{
		CognitoDomain: &awscognito.CognitoDomainOptions{
			DomainPrefix: jsii.String(fmt.Sprintf("%s-datti", env)),
		},
	})

	// Callback/Logout URLs based on environment
	var callbackURL, logoutURL string
	if env == "prod" {
		callbackURL = "https://datti.app/api/auth/cognito/callback"
		logoutURL = "https://datti.app/auth"
	} else {
		callbackURL = fmt.Sprintf("https://%s.datti.app/api/auth/cognito/callback", env)
		logoutURL = fmt.Sprintf("https://%s.datti.app/auth", env)
	}

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
			CallbackUrls: jsii.Strings(callbackURL),
			LogoutUrls:   jsii.Strings(logoutURL),
		},
		SupportedIdentityProviders: &[]awscognito.UserPoolClientIdentityProvider{
			awscognito.UserPoolClientIdentityProvider_GOOGLE(),
		},
		AccessTokenValidity:  awscdk.Duration_Hours(jsii.Number(1)),
		IdTokenValidity:      awscdk.Duration_Hours(jsii.Number(1)),
		RefreshTokenValidity: awscdk.Duration_Days(jsii.Number(30)),
	})
	userPoolClient.Node().AddDependency(googleIdp)

	return &CognitoResources{
		UserPool:       userPool,
		UserPoolClient: userPoolClient,
		UserPoolDomain: userPoolDomain,
	}
}
