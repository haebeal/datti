package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ecr"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func createAWSResources(ctx *pulumi.Context) error {
	// VPC
	vpc, err := ec2.NewVpc(ctx, "datti-vpc", &ec2.VpcArgs{
		CidrBlock:          pulumi.String("10.0.0.0/16"),
		EnableDnsHostnames: pulumi.Bool(true),
		EnableDnsSupport:   pulumi.Bool(true),
		Tags: pulumi.StringMap{
			"Name": pulumi.String("datti-vpc"),
		},
	})
	if err != nil {
		return err
	}

	// パブリックサブネット
	subnet, err := ec2.NewSubnet(ctx, "datti-subnet", &ec2.SubnetArgs{
		VpcId:               vpc.ID(),
		CidrBlock:           pulumi.String("10.0.1.0/24"),
		AvailabilityZone:    pulumi.String("ap-northeast-1a"),
		MapPublicIpOnLaunch: pulumi.Bool(true), // 起動時にPublicIPを紐付け
		Tags: pulumi.StringMap{
			"Name": pulumi.String("datti-subnet"),
		},
	})
	if err != nil {
		return err
	}

	// インターネットゲートウェイ
	igw, err := ec2.NewInternetGateway(ctx, "datti-igw", &ec2.InternetGatewayArgs{
		VpcId: vpc.ID(),
		Tags: pulumi.StringMap{
			"Name": pulumi.String("datti-igw"),
		},
	})
	if err != nil {
		return err
	}

	// ルートテーブル
	rt, err := ec2.NewRouteTable(ctx, "datti-rt", &ec2.RouteTableArgs{
		VpcId: vpc.ID(),
		Routes: ec2.RouteTableRouteArray{
			&ec2.RouteTableRouteArgs{
				CidrBlock: pulumi.String("0.0.0.0/0"),
				GatewayId: igw.ID(),
			},
		},
		Tags: pulumi.StringMap{
			"Name": pulumi.String("datti-rt"),
		},
	})
	if err != nil {
		return err
	}

	// サブネットとルートテーブルを紐付け
	_, err = ec2.NewRouteTableAssociation(ctx, "datti-rta", &ec2.RouteTableAssociationArgs{
		SubnetId:     subnet.ID(),
		RouteTableId: rt.ID(),
	})
	if err != nil {
		return err
	}

	// ECR ライフサイクルポリシー
	// NOTE: コスト削減のためuntaggedになってから一日経ったイメージを全て削除
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

	// ECRリポジトリ
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

	// ECS Instance(EC2) ロール
	ec2AssumeRolePolicy := `{
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": {
					"Service": "ec2.amazonaws.com"
				},
				"Action": "sts:AssumeRole"
			}
		]
	}`
	instanceRole, err := iam.NewRole(ctx, "datti-ecs-instance-role", &iam.RoleArgs{
		Name:             pulumi.String("datti-ecs-instance-role"),
		AssumeRolePolicy: pulumi.String(ec2AssumeRolePolicy),
	})
	if err != nil {
		return err
	}

	// ECS InstanceロールにECSマネージドポリシーをアタッチ
	_, err = iam.NewRolePolicyAttachment(ctx, "datti-ecs-instance-policy", &iam.RolePolicyAttachmentArgs{
		Role:      instanceRole.Name,
		PolicyArn: pulumi.String("arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"),
	})
	if err != nil {
		return err
	}

	// ECS Task ロール
	ecsAssumeRolePolicy := `{
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": {
					"Service": "ecs-tasks.amazonaws.com"
				},
				"Action": "sts:AssumeRole"
			}
		]
	}`
	executionRole, err := iam.NewRole(ctx, "datti-ecs-execution-role", &iam.RoleArgs{
		Name:             pulumi.String("datti-ecs-execution-role"),
		AssumeRolePolicy: pulumi.String(ecsAssumeRolePolicy),
	})
	if err != nil {
		return err
	}

	// ECS TaskExecutionマネジードポリシーをアタッチ
	_, err = iam.NewRolePolicyAttachment(ctx, "datti-ecs-execution-policy", &iam.RolePolicyAttachmentArgs{
		Role:      executionRole.Name,
		PolicyArn: pulumi.String("arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"),
	})
	if err != nil {
		return err
	}

	// SSM Parameter Storeの読み取りポリシーをアタッチ
	_, err = iam.NewRolePolicyAttachment(ctx, "datti-ecs-execution-ssm-policy", &iam.RolePolicyAttachmentArgs{
		Role:      executionRole.Name,
		PolicyArn: pulumi.String("arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"),
	})
	if err != nil {
		return err
	}

	return nil
}
