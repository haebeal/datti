package aws

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ecr"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type ecrOutput struct {
	backendRepoURL  pulumi.StringOutput
	frontendRepoURL pulumi.StringOutput
}

func createECR(ctx *pulumi.Context) (*ecrOutput, error) {
	////////////////////////////////
	// ECR ライフサイクルポリシー
	// NOTE: コスト削減のためuntaggedになってから一日経ったイメージを全て削除
	////////////////////////////////
	ecrLifecyclePolicy := `{
		"rules": [
			{
				"rulePriority": 1,
				"description": "Delete untagged images after 1 day",
				"selection": {
					"tagStatus": "untagged",
					"countType": "sinceImagePushed",
					"countUnit": "days",
					"countNumber": 1
				},
				"action": {
					"type": "expire"
				}
			}
		]
	}`

	////////////////////////////////
	// Backend ECRリポジトリ
	////////////////////////////////
	backendRepo, err := ecr.NewRepository(ctx, "datti-backend", &ecr.RepositoryArgs{
		Name:               pulumi.String("datti-backend"),
		ImageTagMutability: pulumi.String("MUTABLE"),
		ForceDelete:        pulumi.Bool(true),
	})
	if err != nil {
		return nil, err
	}

	_, err = ecr.NewLifecyclePolicy(ctx, "datti-backend-lifecycle", &ecr.LifecyclePolicyArgs{
		Repository: backendRepo.Name,
		Policy:     pulumi.String(ecrLifecyclePolicy),
	})
	if err != nil {
		return nil, err
	}

	////////////////////////////////
	// Frontend ECRリポジトリ
	////////////////////////////////
	frontendRepo, err := ecr.NewRepository(ctx, "datti-frontend", &ecr.RepositoryArgs{
		Name:               pulumi.String("datti-frontend"),
		ImageTagMutability: pulumi.String("MUTABLE"),
		ForceDelete:        pulumi.Bool(true),
	})
	if err != nil {
		return nil, err
	}

	_, err = ecr.NewLifecyclePolicy(ctx, "datti-frontend-lifecycle", &ecr.LifecyclePolicyArgs{
		Repository: frontendRepo.Name,
		Policy:     pulumi.String(ecrLifecyclePolicy),
	})
	if err != nil {
		return nil, err
	}

	return &ecrOutput{
		backendRepoURL:  backendRepo.RepositoryUrl,
		frontendRepoURL: frontendRepo.RepositoryUrl,
	}, nil
}
