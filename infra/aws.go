package main

import (
	"encoding/json"
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ecr"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ecs"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
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

	// ECS Instance(EC2) プロファイル
	instanceProfile, err := iam.NewInstanceProfile(ctx, "datti-ecs-instance-profile", &iam.InstanceProfileArgs{
		Name: pulumi.String("datti-ecs-instance-profile"),
		Role: instanceRole.Name,
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

	// ECSクラスター
	cluster, err := ecs.NewCluster(ctx, "datti-cluster", &ecs.ClusterArgs{
		Name: pulumi.String("datti-cluster"),
	})
	if err != nil {
		return err
	}

	// セキュリティグループ
	// NOTE: アウトバウンドのみ許可するように
	sg, err := ec2.NewSecurityGroup(ctx, "datti-ecs-sg", &ec2.SecurityGroupArgs{
		Name:        pulumi.String("datti-ecs-sg"),
		Description: pulumi.String("Security group for Datti ECS instances"),
		VpcId:       vpc.ID(),
		Egress: ec2.SecurityGroupEgressArray{
			&ec2.SecurityGroupEgressArgs{
				Protocol:   pulumi.String("-1"), // TODO: 全てのプロトコルになっているため、Cloudflare Tunnnelに必要なプロトコルに絞る
				FromPort:   pulumi.Int(0),
				ToPort:     pulumi.Int(0),
				CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
			},
		},
		Tags: pulumi.StringMap{
			"Name": pulumi.String("datti-ecs-sg"),
		},
	})
	if err != nil {
		return err
	}

	// ECS最適化AMIを取得
	// NOTE: AWSはSSM Parameter Storeに最新AMIのIDを公開している
	ecsAmi, err := ssm.LookupParameter(ctx, &ssm.LookupParameterArgs{
		Name: "/aws/service/ecs/optimized-ami/amazon-linux-2023/arm64/recommended/image_id",
	})
	if err != nil {
		return err
	}

	// クラスタ名が設定される
	// TODO: ここの理解をしたい
	userData := cluster.Name.ApplyT(func(name string) string {
		return fmt.Sprintf(`#!/bin/bash
echo ECS_CLUSTER=%s >> /etc/ecs/ecs.config
`, name)
	}).(pulumi.StringOutput)

	// ECS Instanceとして使用するEC2(t4g.small)を作成
	_, err = ec2.NewInstance(ctx, "datti-ecs-instance", &ec2.InstanceArgs{
		Ami:                 pulumi.String(ecsAmi.Value),
		InstanceType:        pulumi.String("t4g.small"),
		SubnetId:            subnet.ID(),
		VpcSecurityGroupIds: pulumi.StringArray{sg.ID()},
		IamInstanceProfile:  instanceProfile.Name,
		UserData:            userData,
		Tags: pulumi.StringMap{
			"Name": pulumi.String("datti-ecs-instance"),
		},
	})
	if err != nil {
		return err
	}

	callerIdentity, err := aws.GetCallerIdentity(ctx, nil)
	if err != nil {
		return err
	}
	accountID := callerIdentity.AccountId
	region := "ap-northeast-1"

	manualParams := []struct {
		Name string
		Type string
	}{
		{Name: "/datti/dev/backend/FIREBASE_PROJECT_ID", Type: "String"},
		{Name: "/datti/dev/frontend/GOOGLE_CLIENT_ID", Type: "String"},
		{Name: "/datti/dev/frontend/GOOGLE_CLIENT_SECRET", Type: "SecureString"},
		{Name: "/datti/dev/frontend/FIREBASE_API_KEY", Type: "SecureString"},
	}
	for _, p := range manualParams {
		_, err := ssm.NewParameter(ctx, p.Name, &ssm.ParameterArgs{
			Name:  pulumi.String(p.Name),
			Type:  pulumi.String(p.Type),
			Value: pulumi.String("PLACEHOLDER"),
		})
		if err != nil {
			return err
		}
	}

	type EnvVar struct {
		Name  string `json:"name"`
		Value string `json:"value"`
	}

	type Secret struct {
		Name      string `json:"name"`
		ValueFrom string `json:"valueFrom"`
	}

	type ServiceConfig struct {
		Name          string
		Image         string
		ContainerPort int
		HostPort      int
		CPU           string
		Memory        string
		EnvVars       []EnvVar
		Secrets       []Secret
	}
	services := []ServiceConfig{
		// FIXME: イメージPush後にコメントアウトを解除
		{
			Name:          "backend-dev",
			Image:         "datti-backend:dev",
			ContainerPort: 8080,
			HostPort:      8081,
			CPU:           "128",
			Memory:        "256",
			EnvVars: []EnvVar{
				{Name: "APP_ENV", Value: "production"},
			},
			Secrets: []Secret{
				{Name: "DSN", ValueFrom: fmt.Sprintf("arn:aws:%s:%s:parameter/datti/dev/backend/DSN")},
				{Name: "FIREBASE_PROJECT_ID", ValueFrom: fmt.Sprintf("arn:aws:%s:%s:parameter/datti/dev/backend/FIREBASE_PROJECT_ID", region, accountID)},
			},
		},
		{
			Name:          "frontend-dev",
			Image:         "datti-frontend:dev",
			ContainerPort: 3000,
			HostPort:      3001,
			CPU:           "128",
			Memory:        "256",
			EnvVars: []EnvVar{
				{Name: "API_URL", Value: "http://localhost:8080"},
				{Name: "APP_URL", Value: "https://dev.datti.app"},
			},
			Secrets: []Secret{
				{Name: "GOOGLE_CLIENT_ID", ValueFrom: fmt.Sprintf("arn:aws:%s:%s:parameter/datti/dev/frontend/GOOGLE_CLIENT_ID", region, accountID)},
				{Name: "GOOGLE_CLIENT_SECRET", ValueFrom: fmt.Sprintf("arn:aws:%s:%s:parameter/datti/dev/frontend/GOOGLE_CLIENT_SECRET", region, accountID)},
				{Name: "FIREBASE_API_KEY", ValueFrom: fmt.Sprintf("arn:aws:%s:%s:parameter/datti/dev/frontend/FIREBASE_API_KEY", region, accountID)},
				{Name: "UPSTASH_REDIS_REST_URL", ValueFrom: fmt.Sprintf("arn:aws:%s:%s:parameter/datti/dev/frontend/UPSTASH_REDIS_REST_URL", region, accountID)},
				{Name: "UPSTASH_REDIS_REST_TOKEN", ValueFrom: fmt.Sprintf("arn:aws:%s:%s:parameter/datti/dev/frontend/UPSTASH_REDIS_REST_TOKEN", region, accountID)},
			},
		},
	}
	for _, svc := range services {
		envVarsJson, err := json.Marshal(svc.EnvVars)
		if err != nil {
			return err
		}
		secretsJson, err := json.Marshal(svc.Secrets)
		if err != nil {
			return err
		}

		containerDef := fmt.Sprintf(`[
			{
				"name": "%s",
				"image": "%s.dkr.ecr.%s.amazonaws.com/%s",
				"cpu": %s,
				"memory": %s,
				"essential": true,
				"portMappings": [
					{
						"containerPort": %d,
						"hostPort": %d,
						"protocol": "tcp"
					}
				],
				"logConfiguration": {
					"logDriver": "awslogs",
					"options": {
						"awslogs-group": "/ecs/%s",
						"awslogs-region": "%s",
						"awslogs-stream-prefix": "ecs"
					}
				},
				"environment": %s,
				"secrets": %s
			}
		]`, svc.Name, accountID, region, svc.Image, svc.CPU, svc.Memory, svc.ContainerPort, svc.HostPort, svc.Name, region, string(envVarsJson), string(secretsJson))

		taskDef, err := ecs.NewTaskDefinition(ctx, svc.Name+"-task", &ecs.TaskDefinitionArgs{
			Family:                  pulumi.String(svc.Name),
			NetworkMode:             pulumi.String("host"),
			RequiresCompatibilities: pulumi.StringArray{pulumi.String("EC2")},
			ExecutionRoleArn:        executionRole.Arn,
			ContainerDefinitions:    pulumi.String(containerDef),
		})
		if err != nil {
			return err
		}

		// ECS Service
		_, err = ecs.NewService(ctx, svc.Name+"-service", &ecs.ServiceArgs{
			Name:           pulumi.String(svc.Name),
			Cluster:        cluster.Arn,
			TaskDefinition: taskDef.Arn,
			DesiredCount:   pulumi.Int(1),
			LaunchType:     pulumi.String("EC2"),
		})
		if err != nil {
			return err
		}
	}

	ctx.Export("ecsClusterName", cluster.Name)

	return nil
}
