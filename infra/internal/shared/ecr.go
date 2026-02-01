package shared

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecr"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type ECRResources struct {
	BackendRepo  awsecr.IRepository
	FrontendRepo awsecr.IRepository
}

func newECR(scope constructs.Construct) *ECRResources {
	lifecycleRule := &awsecr.LifecycleRule{
		Description:  jsii.String("Delete untagged images after 1 day"),
		RulePriority: jsii.Number(1),
		TagStatus:    awsecr.TagStatus_UNTAGGED,
		MaxImageAge:  awscdk.Duration_Days(jsii.Number(1)),
	}

	backendRepo := awsecr.NewRepository(scope, jsii.String("DattiBackendRepo"), &awsecr.RepositoryProps{
		RepositoryName:     jsii.String("datti-backend"),
		ImageTagMutability: awsecr.TagMutability_MUTABLE,
		RemovalPolicy:      awscdk.RemovalPolicy_DESTROY,
		EmptyOnDelete:      jsii.Bool(true),
		LifecycleRules:     &[]*awsecr.LifecycleRule{lifecycleRule},
	})

	frontendRepo := awsecr.NewRepository(scope, jsii.String("DattiFrontendRepo"), &awsecr.RepositoryProps{
		RepositoryName:     jsii.String("datti-frontend"),
		ImageTagMutability: awsecr.TagMutability_MUTABLE,
		RemovalPolicy:      awscdk.RemovalPolicy_DESTROY,
		EmptyOnDelete:      jsii.Bool(true),
		LifecycleRules:     &[]*awsecr.LifecycleRule{lifecycleRule},
	})

	return &ECRResources{
		BackendRepo:  backendRepo,
		FrontendRepo: frontendRepo,
	}
}
