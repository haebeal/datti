package stack

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecr"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type ecrResources struct {
	BackendRepo  awsecr.IRepository
	FrontendRepo awsecr.IRepository
}

func newECR(scope constructs.Construct, env string) *ecrResources {
	lifecycleRule := &awsecr.LifecycleRule{
		Description:  jsii.String("Delete untagged images after 1 day"),
		RulePriority: jsii.Number(1),
		TagStatus:    awsecr.TagStatus_UNTAGGED,
		MaxImageAge:  awscdk.Duration_Days(jsii.Number(1)),
	}

	backendRepo := awsecr.NewRepository(scope, jsii.String("DattiBackendRepo"), &awsecr.RepositoryProps{
		RepositoryName:     jsii.String(fmt.Sprintf("%s-datti-backend", env)),
		ImageTagMutability: awsecr.TagMutability_MUTABLE,
		RemovalPolicy:      awscdk.RemovalPolicy_DESTROY,
		EmptyOnDelete:      jsii.Bool(true),
		LifecycleRules:     &[]*awsecr.LifecycleRule{lifecycleRule},
	})

	frontendRepo := awsecr.NewRepository(scope, jsii.String("DattiFrontendRepo"), &awsecr.RepositoryProps{
		RepositoryName:     jsii.String(fmt.Sprintf("%s-datti-frontend", env)),
		ImageTagMutability: awsecr.TagMutability_MUTABLE,
		RemovalPolicy:      awscdk.RemovalPolicy_DESTROY,
		EmptyOnDelete:      jsii.Bool(true),
		LifecycleRules:     &[]*awsecr.LifecycleRule{lifecycleRule},
	})

	return &ecrResources{
		BackendRepo:  backendRepo,
		FrontendRepo: frontendRepo,
	}
}
