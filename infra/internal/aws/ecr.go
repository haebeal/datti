package aws

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ecr"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func createECR(ctx *pulumi.Context) error {
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
	// ECRリポジトリ
	////////////////////////////////
	ecrRepos := []string{"datti-backend", "datti-frontend"}
	for _, name := range ecrRepos {
		repo, err := ecr.NewRepository(ctx, name, &ecr.RepositoryArgs{
			Name:               pulumi.String(name),
			ImageTagMutability: pulumi.String("MUTABLE"),
			ForceDelete:        pulumi.Bool(true),
		})
		if err != nil {
			return err
		}

		_, err = ecr.NewLifecyclePolicy(ctx, name+"-lifecycle", &ecr.LifecyclePolicyArgs{
			Repository: repo.Name,
			Policy:     pulumi.String(ecrLifecyclePolicy),
		})
		if err != nil {
			return err
		}
	}

	return nil
}
