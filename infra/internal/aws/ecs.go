package aws

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/cloudwatch"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ecs"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type ecsConfig struct {
	subnetID             pulumi.StringInput
	securityGroupID      pulumi.StringInput
	backendRepoURL       pulumi.StringInput
	frontendRepoURL      pulumi.StringInput
	dsnARN               pulumi.StringInput
	cloudflaredTokenARN  pulumi.StringInput
	cognitoDomainARN     pulumi.StringInput
	cognitoClientIDARN   pulumi.StringInput
	upstashRedisURLARN   pulumi.StringInput
	upstashRedisTokenARN pulumi.StringInput
}

func createECS(ctx *pulumi.Context, cfg ecsConfig) error {
	////////////////////////////////
	// ECS クラスター
	////////////////////////////////
	cluster, err := ecs.NewCluster(ctx, "datti-cluster", &ecs.ClusterArgs{
		Name: pulumi.String("datti-cluster"),
	})
	if err != nil {
		return err
	}

	////////////////////////////////
	// EC2 インスタンス
	////////////////////////////////
	// インスタンスロール
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

	// インスタンスロールにECSマネージドポリシーをアタッチ
	_, err = iam.NewRolePolicyAttachment(ctx, "datti-ecs-instance-policy", &iam.RolePolicyAttachmentArgs{
		Role:      instanceRole.Name,
		PolicyArn: pulumi.String("arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"),
	})
	if err != nil {
		return err
	}
	// インスタンスロールにSSM読み取りポリシーをアタッチ
	_, err = iam.NewRolePolicyAttachment(ctx, "datti-ecs-instance-ssm-policy", &iam.RolePolicyAttachmentArgs{
		Role:      instanceRole.Name,
		PolicyArn: pulumi.String("arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"),
	})
	if err != nil {
		return err
	}

	// インスタンスプロファイル
	instanceProfile, err := iam.NewInstanceProfile(ctx, "datti-ecs-instance-profile", &iam.InstanceProfileArgs{
		Name: pulumi.String("datti-ecs-instance-profile"),
		Role: instanceRole.Name,
	})
	if err != nil {
		return err
	}

	// ECS最適化AMI
	// NOTE: AWSはSSM Parameter Storeに最新AMIのIDを公開している
	ecsAmi, err := ssm.LookupParameter(ctx, &ssm.LookupParameterArgs{
		Name: "/aws/service/ecs/optimized-ami/amazon-linux-2023/arm64/recommended/image_id",
	})
	if err != nil {
		return err
	}

	// ユーザーデーター
	userData := cluster.Name.ApplyT(func(name string) string {
		return fmt.Sprintf(`#!/bin/bash
echo ECS_CLUSTER=%s >> /etc/ecs/ecs.config
`, name)
	}).(pulumi.StringOutput)

	// EC2インスタンス (t4g.small)
	// NOTE: t4g.smallは2026年12月末まで無料
	_, err = ec2.NewInstance(ctx, "datti-ecs-instance", &ec2.InstanceArgs{
		Ami:                 pulumi.String(ecsAmi.Value),
		InstanceType:        pulumi.String("t4g.small"),
		SubnetId:            cfg.subnetID,
		VpcSecurityGroupIds: pulumi.StringArray{cfg.securityGroupID},
		IamInstanceProfile:  instanceProfile.Name,
		UserData:            userData,
		Tags: pulumi.StringMap{
			"Name": pulumi.String("datti-ecs-instance"),
		},
	})
	if err != nil {
		return err
	}

	////////////////////////////////
	// ECC タスク
	////////////////////////////////
	// ECSタスクからAssumeRoleできるようにするポリシー
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

	// execution ロール
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

	taskRole, err := iam.NewRole(ctx, "datti-ecs-task-role", &iam.RoleArgs{
		Name:             pulumi.String("datti-ecs-task-role"),
		AssumeRolePolicy: pulumi.String(ecsAssumeRolePolicy),
	})
	if err != nil {
		return err
	}

	// Cognito読み取り権限
	_, err = iam.NewRolePolicyAttachment(ctx, "datti-ecs-task-cognito-policy", &iam.RolePolicyAttachmentArgs{
		Role:      taskRole.Name,
		PolicyArn: pulumi.String("arn:aws:iam::aws:policy/AmazonCognitoReadOnly"),
	})
	if err != nil {
		return err
	}

	// X-Ray書き込み権限
	_, err = iam.NewRolePolicyAttachment(ctx, "datti-ecs-execution-xray-policy", &iam.RolePolicyAttachmentArgs{
		Role:      taskRole.Name,
		PolicyArn: pulumi.String("arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"),
	})
	if err != nil {
		return err
	}

	////////////////////////////////
	// Backend サービス
	////////////////////////////////
	// ロググループ
	_, err = cloudwatch.NewLogGroup(ctx, "/ecs/backend-dev", &cloudwatch.LogGroupArgs{
		Name:            pulumi.String("/ecs/backend-dev"),
		RetentionInDays: pulumi.Int(7),
	})
	if err != nil {
		return err
	}

	backendContainerDef := pulumi.All(cfg.backendRepoURL, cfg.dsnARN).ApplyT(
		func(args []any) string {
			repoURL := args[0].(string)
			dsnARN := args[1].(string)
			return fmt.Sprintf(`[
		{
			"name": "backend-dev",
			"image": "%s:dev",
			"cpu": 128,
			"memory": 256,
			"essential": true,
			"portMappings": [
				{
					"containerPort": 8080,
					"hostPort": 8081,
					"protocol": "tcp"
				}
			],
			"logConfiguration": {
				"logDriver": "awslogs",
				"options": {
					"awslogs-group": "/ecs/backend-dev",
					"awslogs-region": "ap-northeast-1",
						"awslogs-stream-prefix": "ecs"
				}
			},
			"environment": [
				{"name": "PORT", "value": "8080"},
				{"name": "OTEL_EXPORTER_OTLP_ENDPOINT", "value": "http://localhost:4318"}
			],
			"secrets": [
				{"name": "DSN", "valueFrom": "%s" }
			]
		},
		{
			"name": "aws-otel-collector",
			"image": "amazon/aws-otel-collector:latest",
			"cpu": 64,
			"memory": 128,
			"essential": false,
			"command": ["--config=/etc/ecs/ecs-default-config.yaml"]
		}
	]`, repoURL, dsnARN)
		},
	).(pulumi.StringOutput)

	// タスク定義
	backendTaskDef, err := ecs.NewTaskDefinition(ctx, "backend-dev-task", &ecs.TaskDefinitionArgs{
		Family:                  pulumi.String("backend-dev"),
		NetworkMode:             pulumi.String("bridge"),
		RequiresCompatibilities: pulumi.StringArray{pulumi.String("EC2")},
		ExecutionRoleArn:        executionRole.Arn,
		TaskRoleArn:             taskRole.Arn,
		ContainerDefinitions:    backendContainerDef,
	})
	if err != nil {
		return err
	}

	// サービス
	_, err = ecs.NewService(ctx, "backend-dev-service", &ecs.ServiceArgs{
		Name:                            pulumi.String("backend-dev"),
		Cluster:                         cluster.Arn,
		TaskDefinition:                  backendTaskDef.Arn,
		DesiredCount:                    pulumi.Int(1),
		LaunchType:                      pulumi.String("EC2"),
		DeploymentMinimumHealthyPercent: pulumi.Int(0),
		DeploymentMaximumPercent:        pulumi.Int(100),
		AvailabilityZoneRebalancing:     pulumi.String("DISABLED"),
	})
	if err != nil {
		return err
	}

	////////////////////////////////
	// Frontendサービス
	////////////////////////////////
	// ロググループ
	_, err = cloudwatch.NewLogGroup(ctx, "/ecs/frontend-dev", &cloudwatch.LogGroupArgs{
		Name:            pulumi.String("/ecs/frontend-dev"),
		RetentionInDays: pulumi.Int(7),
	})
	if err != nil {
		return err
	}

	frontendContainerDef := pulumi.All(
		cfg.frontendRepoURL,
		cfg.cognitoDomainARN,
		cfg.cognitoClientIDARN,
		cfg.upstashRedisURLARN,
		cfg.upstashRedisTokenARN,
		cfg.cloudflaredTokenARN,
	).ApplyT(
		func(args []any) string {
			repoURL := args[0].(string)
			cognitoDomainARN := args[1].(string)
			cognitoClientIDARN := args[2].(string)
			upstashURLARN := args[3].(string)
			upstashTokenARN := args[4].(string)
			cloudflaredTokenARN := args[5].(string)

			return fmt.Sprintf(`[
		{
			"name": "frontend-dev",
			"image": "%s:dev",
			"cpu": 128,
			"memory": 256,
			"essential": true,
			"logConfiguration": {
				"logDriver": "awslogs",
				"options": {
					"awslogs-group": "/ecs/frontend-dev",
					"awslogs-region": "ap-northeast-1",
					"awslogs-stream-prefix": "ecs"
				}
			},
			"environment": [
				{"name": "API_URL", "value": "http://172.17.0.1:8081"},
				{"name": "APP_URL", "value": "https://dev.datti.app"}
			],
			"secrets": [
				{"name": "COGNITO_DOMAIN", "valueFrom": "%s"},
				{"name": "COGNITO_CLIENT_ID", "valueFrom": "%s"},
				{"name": "UPSTASH_REDIS_REST_URL", "valueFrom": "%s"},
				{"name": "UPSTASH_REDIS_REST_TOKEN", "valueFrom": "%s"}
			]
		},
		{
			"name": "aws-otel-collector",
			"image": "amazon/aws-otel-collector:latest",
			"cpu": 64,
			"memory": 128,
			"essential": false,
			"command": ["--config=/etc/ecs/ecs-default-config.yaml"]
		},
		{
			"name": "cloudflared",
			"image": "cloudflare/cloudflared:latest",
			"cpu": 64,
			"memory": 128,
			"essential": true,
			"command": ["tunnel", "--no-autoupdate", "run"],
			"environment": [
				{"name": "TUNNEL_URL", "value": "http://localhost:3000"}
			],
			"secrets": [
				{"name": "TUNNEL_TOKEN", "valueFrom": "%s"}
			]
		}
	]`, repoURL, cognitoDomainARN, cognitoClientIDARN, upstashURLARN, upstashTokenARN, cloudflaredTokenARN)
		},
	).(pulumi.StringOutput)

	// タスク定義
	frontendTaskDef, err := ecs.NewTaskDefinition(ctx, "frontend-dev-task", &ecs.TaskDefinitionArgs{
		Family:                  pulumi.String("frontend-dev"),
		NetworkMode:             pulumi.String("bridge"),
		RequiresCompatibilities: pulumi.StringArray{pulumi.String("EC2")},
		ExecutionRoleArn:        executionRole.Arn,
		TaskRoleArn:             taskRole.Arn,
		ContainerDefinitions:    frontendContainerDef,
	})
	if err != nil {
		return err
	}

	// サービス
	_, err = ecs.NewService(ctx, "frontend-dev-service", &ecs.ServiceArgs{
		Name:                            pulumi.String("frontend-dev"),
		Cluster:                         cluster.Arn,
		TaskDefinition:                  frontendTaskDef.Arn,
		DesiredCount:                    pulumi.Int(1),
		LaunchType:                      pulumi.String("EC2"),
		DeploymentMinimumHealthyPercent: pulumi.Int(0),
		DeploymentMaximumPercent:        pulumi.Int(100),
		AvailabilityZoneRebalancing:     pulumi.String("DISABLED"),
	})
	if err != nil {
		return err
	}

	return nil
}
