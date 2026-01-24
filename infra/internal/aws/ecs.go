package aws

import (
	"encoding/json"
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ecs"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func createECS(ctx *pulumi.Context, subnetID pulumi.StringInput, sgID pulumi.StringInput, region string, accountID string) error {
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

# cloudflaredインストール (ARM64)
curl -L \
	https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 \
	-o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Tunnel認証
TOKEN=$(aws ssm get-parameter --name /datti/cloudflared/token --with-decryption --query Parameter.Value --output text --region ap-northeast-1)
cloudflared service install $TOKEN
`, name)
	}).(pulumi.StringOutput)

	// EC2インスタンス (t4g.small)
	// NOTE: t4g.smallは2026年12月末まで無料
	_, err = ec2.NewInstance(ctx, "datti-ecs-instance", &ec2.InstanceArgs{
		Ami:                 pulumi.String(ecsAmi.Value),
		InstanceType:        pulumi.String("t4g.small"),
		SubnetId:            subnetID,
		VpcSecurityGroupIds: pulumi.StringArray{sgID},
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
	// ECS タスク ロール
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

	// X-Ray書き込み権限
	_, err = iam.NewRolePolicyAttachment(ctx, "datti-ecs-execution-xray-policy", &iam.RolePolicyAttachmentArgs{
		Role:      executionRole.Name,
		PolicyArn: pulumi.String("arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"),
	})
	if err != nil {
		return err
	}

	////////////////////////////////
	// ECC サービス
	////////////////////////////////
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
		{
			Name:          "backend-dev",
			Image:         "datti-backend:dev",
			ContainerPort: 8080,
			HostPort:      8081,
			CPU:           "128",
			Memory:        "256",
			EnvVars: []EnvVar{
				{Name: "PORT", Value: "8080"},
				{Name: "OTEL_EXPORTER_OTLP_ENDPOINT", Value: "http://localhost:4318"},
			},
			Secrets: []Secret{
				{Name: "DSN", ValueFrom: fmt.Sprintf("arn:aws:ssm:%s:%s:parameter/datti/dev/backend/DSN", region, accountID)},
				{Name: "FIREBASE_PROJECT_ID", ValueFrom: fmt.Sprintf("arn:aws:ssm:%s:%s:parameter/datti/dev/backend/FIREBASE_PROJECT_ID", region, accountID)},
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
				{Name: "API_URL", Value: "http://172.17.0.1:8081"},
				{Name: "APP_URL", Value: "https://dev.datti.app"},
			},
			Secrets: []Secret{
				{Name: "GOOGLE_CLIENT_ID", ValueFrom: fmt.Sprintf("arn:aws:ssm:%s:%s:parameter/datti/dev/frontend/GOOGLE_CLIENT_ID", region, accountID)},
				{Name: "GOOGLE_CLIENT_SECRET", ValueFrom: fmt.Sprintf("arn:aws:ssm:%s:%s:parameter/datti/dev/frontend/GOOGLE_CLIENT_SECRET", region, accountID)},
				{Name: "FIREBASE_API_KEY", ValueFrom: fmt.Sprintf("arn:aws:ssm:%s:%s:parameter/datti/dev/frontend/FIREBASE_API_KEY", region, accountID)},
				{Name: "UPSTASH_REDIS_REST_URL", ValueFrom: fmt.Sprintf("arn:aws:ssm:%s:%s:parameter/datti/dev/frontend/UPSTASH_REDIS_REST_URL", region, accountID)},
				{Name: "UPSTASH_REDIS_REST_TOKEN", ValueFrom: fmt.Sprintf("arn:aws:ssm:%s:%s:parameter/datti/dev/frontend/UPSTASH_REDIS_REST_TOKEN", region, accountID)},
			},
		},
	}
	for _, svc := range services {
		envVarsJSON, err := json.Marshal(svc.EnvVars)
		if err != nil {
			return err
		}
		secretsJSON, err := json.Marshal(svc.Secrets)
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
						"awslogs-stream-prefix": "ecs",
						"awslogs-create-group": "true"
					}
				},
				"environment": %s,
				"secrets": %s
			},
			{
				"name": "aws-otel-collector",
				"image": "amazon/aws-otel-collector:latest",
				"cpu": 64,
				"memory": 128,
				"essential": false,
				"command": ["--config=/etc/ecs/ecs-default-config.yaml"]
			}
		]`, svc.Name, accountID, region, svc.Image, svc.CPU, svc.Memory, svc.ContainerPort, svc.HostPort, svc.Name, region, string(envVarsJSON), string(secretsJSON))

		taskDef, err := ecs.NewTaskDefinition(ctx, svc.Name+"-task", &ecs.TaskDefinitionArgs{
			Family:                  pulumi.String(svc.Name),
			NetworkMode:             pulumi.String("bridge"),
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

	return nil
}
