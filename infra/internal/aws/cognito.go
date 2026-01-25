package aws

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cognito"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func createCognito(ctx *pulumi.Context) error {
	conf := config.New(ctx, "")

	////////////////////////////////
	// User Pool
	////////////////////////////////
	userPool, err := cognito.NewUserPool(ctx, "datti-user-pool", &cognito.UserPoolArgs{
		Name: pulumi.String("datti-user-pool"),
		PasswordPolicy: &cognito.UserPoolPasswordPolicyArgs{
			MinimumLength:    pulumi.Int(8),
			RequireLowercase: pulumi.Bool(false),
			RequireUppercase: pulumi.Bool(false),
			RequireNumbers:   pulumi.Bool(false),
			RequireSymbols:   pulumi.Bool(false),
		},
		// メールアドレスをユーザー名として使用
		UsernameAttributes: pulumi.StringArray{
			pulumi.String("email"),
		},
		// Googleから取得したメールを自動検証済みにする
		AutoVerifiedAttributes: pulumi.StringArray{
			pulumi.String("email"),
		},
		// アカウント復旧はメールのみ
		AccountRecoverySetting: &cognito.UserPoolAccountRecoverySettingArgs{
			RecoveryMechanisms: cognito.UserPoolAccountRecoverySettingRecoveryMechanismArray{
				&cognito.UserPoolAccountRecoverySettingRecoveryMechanismArgs{
					Name:     pulumi.String("verified_email"),
					Priority: pulumi.Int(1),
				},
			},
		},
	})
	if err != nil {
		return err
	}

	////////////////////////////////
	// User Pool Domain
	////////////////////////////////
	domain, err := cognito.NewUserPoolDomain(ctx, "datti-user-pool-domain", &cognito.UserPoolDomainArgs{
		Domain:     pulumi.String("datti-dev"),
		UserPoolId: userPool.ID(),
	})
	if err != nil {
		return err
	}

	////////////////////////////////
	// Google Identity Provider
	////////////////////////////////
	googleClientID := conf.Require("googleClientId")
	googleClientSecret := conf.RequireSecret("googleClientSecret")

	googleIdp, err := cognito.NewIdentityProvider(ctx, "datti-google-idp", &cognito.IdentityProviderArgs{
		UserPoolId:   userPool.ID(),
		ProviderName: pulumi.String("Google"),
		ProviderType: pulumi.String("Google"),
		ProviderDetails: pulumi.StringMap{
			"client_id":        pulumi.String(googleClientID),
			"client_secret":    googleClientSecret.ToStringOutput(),
			"authorize_scopes": pulumi.String("openid email profile"),
		},
		AttributeMapping: pulumi.StringMap{
			"email":    pulumi.String("email"),
			"name":     pulumi.String("name"),
			"picture":  pulumi.String("picture"),
			"username": pulumi.String("sub"),
		},
	})
	if err != nil {
		return err
	}
	////////////////////////////////
	// User Pool Client
	////////////////////////////////
	client, err := cognito.NewUserPoolClient(ctx, "datti-user-pool-client", &cognito.UserPoolClientArgs{
		Name:       pulumi.String("datti-frontend"),
		UserPoolId: userPool.ID(),
		AllowedOauthFlows: pulumi.StringArray{
			pulumi.String("code"),
		},
		AllowedOauthFlowsUserPoolClient: pulumi.Bool(true),
		AllowedOauthScopes: pulumi.StringArray{
			pulumi.String("openid"),
			pulumi.String("email"),
			pulumi.String("profile"),
		},
		CallbackUrls: pulumi.StringArray{
			pulumi.String("https://dev.datti.app/api/auth/cognito/callback"),
		},
		LogoutUrls: pulumi.StringArray{
			pulumi.String("https://dev.datti.app/auth"),
		},
		SupportedIdentityProviders: pulumi.StringArray{
			pulumi.String("Google"),
		},
		AccessTokenValidity:  pulumi.Int(1),
		IdTokenValidity:      pulumi.Int(1),
		RefreshTokenValidity: pulumi.Int(30),
		TokenValidityUnits: &cognito.UserPoolClientTokenValidityUnitsArgs{
			AccessToken:  pulumi.String("hours"),
			IdToken:      pulumi.String("hours"),
			RefreshToken: pulumi.String("days"),
		},
		ExplicitAuthFlows: pulumi.StringArray{
			pulumi.String("ALLOW_REFRESH_TOKEN_AUTH"),
		},
	}, pulumi.DependsOn([]pulumi.Resource{googleIdp}))
	if err != nil {
		return err
	}

	////////////////////////////////
	// SSM Parameters
	////////////////////////////////
	_, err = ssm.NewParameter(ctx, "datti-cognito-user-pool-id", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/dev/COGNITO_USER_POOL_ID"),
		Type:  pulumi.String("String"),
		Value: userPool.ID(),
	})
	if err != nil {
		return err
	}

	_, err = ssm.NewParameter(ctx, "datti-cognito-client-id", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/dev/COGNITO_CLIENT_ID"),
		Type:  pulumi.String("String"),
		Value: client.ID(),
	})
	if err != nil {
		return err
	}

	_, err = ssm.NewParameter(ctx, "datti-cognito-domain", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/dev/COGNITO_DOMAIN"),
		Type:  pulumi.String("String"),
		Value: pulumi.Sprintf("https://%s.auth.ap-northeast-1.amazoncognito.com", domain.Domain),
	})
	if err != nil {
		return err
	}

	_, err = ssm.NewParameter(ctx, "datti-cognito-issuer", &ssm.ParameterArgs{
		Name:  pulumi.String("/datti/dev/COGNITO_ISSUER"),
		Type:  pulumi.String("String"),
		Value: pulumi.Sprintf("https://cognito-idp.ap-northeast-1.amazonaws.com/%s", userPool.ID()),
	})
	if err != nil {
		return err
	}

	return nil
}
