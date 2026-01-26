package stack

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsdynamodb"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecr"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecs"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsssm"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type ecsProps struct {
	Vpc                   awsec2.IVpc
	SecurityGroup         awsec2.ISecurityGroup
	BackendRepo           awsecr.IRepository
	FrontendRepo          awsecr.IRepository
	SessionsTable         awsdynamodb.ITable
	DsnParam              awsssm.IStringParameter
	CognitoDomainParam    awsssm.IStringParameter
	CognitoClientIDParam  awsssm.IStringParameter
	CloudflaredTokenParam awsssm.IStringParameter
}

func newECS(scope constructs.Construct, env string, props *ecsProps) {
	// ECS Cluster
	cluster := awsecs.NewCluster(scope, jsii.String("DattiEcsCluster"), &awsecs.ClusterProps{
		ClusterName: jsii.String(fmt.Sprintf("%s-datti-cluster", env)),
		Vpc:         props.Vpc,
	})

	// EC2 Instance Role
	instanceRole := awsiam.NewRole(scope, jsii.String("DattiEcsInstanceRole"), &awsiam.RoleProps{
		RoleName:  jsii.String(fmt.Sprintf("%s-datti-ecs-instance-role", env)),
		AssumedBy: awsiam.NewServicePrincipal(jsii.String("ec2.amazonaws.com"), nil),
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("service-role/AmazonEC2ContainerServiceforEC2Role")),
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AmazonSSMReadOnlyAccess")),
		},
	})

	// User Data
	userData := awsec2.UserData_ForLinux(nil)
	userData.AddCommands(jsii.String(fmt.Sprintf("echo ECS_CLUSTER=%s >> /etc/ecs/ecs.config", *cluster.ClusterName())))

	// EC2 Instance
	awsec2.NewInstance(scope, jsii.String("DattiEcsInstance"), &awsec2.InstanceProps{
		InstanceName:  jsii.String(fmt.Sprintf("%s-datti-ecs-instance", env)),
		InstanceType:  awsec2.InstanceType_Of(awsec2.InstanceClass_T4G, awsec2.InstanceSize_SMALL),
		MachineImage:  awsecs.EcsOptimizedImage_AmazonLinux2023(awsecs.AmiHardwareType_ARM, nil),
		Vpc:           props.Vpc,
		VpcSubnets:    &awsec2.SubnetSelection{SubnetType: awsec2.SubnetType_PUBLIC},
		SecurityGroup: props.SecurityGroup,
		Role:          instanceRole,
		UserData:      userData,
	})

	// Execution Role
	executionRole := awsiam.NewRole(scope, jsii.String("DattiEcsExecutionRole"), &awsiam.RoleProps{
		RoleName:  jsii.String(fmt.Sprintf("%s-datti-ecs-execution-role", env)),
		AssumedBy: awsiam.NewServicePrincipal(jsii.String("ecs-tasks.amazonaws.com"), nil),
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("service-role/AmazonECSTaskExecutionRolePolicy")),
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AmazonSSMReadOnlyAccess")),
		},
	})

	// Task Role
	taskRole := awsiam.NewRole(scope, jsii.String("DattiEcsTaskRole"), &awsiam.RoleProps{
		RoleName:  jsii.String(fmt.Sprintf("%s-datti-ecs-task-role", env)),
		AssumedBy: awsiam.NewServicePrincipal(jsii.String("ecs-tasks.amazonaws.com"), nil),
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AmazonCognitoReadOnly")),
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AWSXRayDaemonWriteAccess")),
		},
	})
	props.SessionsTable.GrantReadWriteData(taskRole)

	// Backend Service
	createBackendService(scope, env, cluster, executionRole, taskRole, props)

	// Frontend Service
	createFrontendService(scope, env, cluster, executionRole, taskRole, props)
}

func createBackendService(
	scope constructs.Construct,
	env string,
	cluster awsecs.ICluster,
	executionRole awsiam.IRole,
	taskRole awsiam.IRole,
	props *ecsProps,
) {
	logGroup := awslogs.NewLogGroup(scope, jsii.String("DattiBackendLogGroup"), &awslogs.LogGroupProps{
		LogGroupName:  jsii.String(fmt.Sprintf("/ecs/%s-datti-backend", env)),
		Retention:     awslogs.RetentionDays_ONE_WEEK,
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
	})

	taskDef := awsecs.NewEc2TaskDefinition(scope, jsii.String("DattiBackendTaskDef"), &awsecs.Ec2TaskDefinitionProps{
		Family:        jsii.String(fmt.Sprintf("%s-datti-backend", env)),
		NetworkMode:   awsecs.NetworkMode_BRIDGE,
		ExecutionRole: executionRole,
		TaskRole:      taskRole,
	})

	taskDef.AddContainer(jsii.String("DattiBackendContainer"), &awsecs.ContainerDefinitionOptions{
		ContainerName:  jsii.String(fmt.Sprintf("%s-datti-backend", env)),
		Image:          awsecs.ContainerImage_FromEcrRepository(props.BackendRepo, jsii.String(env)),
		Cpu:            jsii.Number(128),
		MemoryLimitMiB: jsii.Number(256),
		Essential:      jsii.Bool(true),
		PortMappings: &[]*awsecs.PortMapping{
			{ContainerPort: jsii.Number(8080), HostPort: jsii.Number(8081), Protocol: awsecs.Protocol_TCP},
		},
		Logging: awsecs.LogDriver_AwsLogs(&awsecs.AwsLogDriverProps{
			LogGroup:     logGroup,
			StreamPrefix: jsii.String("ecs"),
		}),
		Environment: &map[string]*string{
			"PORT":                        jsii.String("8080"),
			"OTEL_EXPORTER_OTLP_ENDPOINT": jsii.String("http://localhost:4318"),
		},
		Secrets: &map[string]awsecs.Secret{
			"DSN": awsecs.Secret_FromSsmParameter(props.DsnParam),
		},
	})

	taskDef.AddContainer(jsii.String("DattiBackendOtelCollector"), &awsecs.ContainerDefinitionOptions{
		ContainerName:  jsii.String("aws-otel-collector"),
		Image:          awsecs.ContainerImage_FromRegistry(jsii.String("amazon/aws-otel-collector:latest"), nil),
		Cpu:            jsii.Number(64),
		MemoryLimitMiB: jsii.Number(128),
		Essential:      jsii.Bool(false),
		Command:        jsii.Strings("--config=/etc/ecs/ecs-default-config.yaml"),
	})

	awsecs.NewEc2Service(scope, jsii.String("DattiBackendService"), &awsecs.Ec2ServiceProps{
		ServiceName:       jsii.String(fmt.Sprintf("%s-datti-backend", env)),
		Cluster:           cluster,
		TaskDefinition:    taskDef,
		DesiredCount:      jsii.Number(1),
		MinHealthyPercent: jsii.Number(0),
		MaxHealthyPercent: jsii.Number(100),
	})
}

func createFrontendService(
	scope constructs.Construct,
	env string,
	cluster awsecs.ICluster,
	executionRole awsiam.IRole,
	taskRole awsiam.IRole,
	props *ecsProps,
) {
	logGroup := awslogs.NewLogGroup(scope, jsii.String("DattiFrontendLogGroup"), &awslogs.LogGroupProps{
		LogGroupName:  jsii.String(fmt.Sprintf("/ecs/%s-datti-frontend", env)),
		Retention:     awslogs.RetentionDays_ONE_WEEK,
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
	})

	taskDef := awsecs.NewEc2TaskDefinition(scope, jsii.String("DattiFrontendTaskDef"), &awsecs.Ec2TaskDefinitionProps{
		Family:        jsii.String(fmt.Sprintf("%s-datti-frontend", env)),
		NetworkMode:   awsecs.NetworkMode_BRIDGE,
		ExecutionRole: executionRole,
		TaskRole:      taskRole,
	})

	// APP_URL based on environment
	var appURL string
	if env == "prod" {
		appURL = "https://datti.app"
	} else {
		appURL = fmt.Sprintf("https://%s.datti.app", env)
	}

	taskDef.AddContainer(jsii.String("DattiFrontendContainer"), &awsecs.ContainerDefinitionOptions{
		ContainerName:  jsii.String(fmt.Sprintf("%s-datti-frontend", env)),
		Image:          awsecs.ContainerImage_FromEcrRepository(props.FrontendRepo, jsii.String(env)),
		Cpu:            jsii.Number(128),
		MemoryLimitMiB: jsii.Number(256),
		Essential:      jsii.Bool(true),
		PortMappings: &[]*awsecs.PortMapping{
			{ContainerPort: jsii.Number(3000), HostPort: jsii.Number(3001), Protocol: awsecs.Protocol_TCP},
		},
		Logging: awsecs.LogDriver_AwsLogs(&awsecs.AwsLogDriverProps{
			LogGroup:     logGroup,
			StreamPrefix: jsii.String("ecs"),
		}),
		Environment: &map[string]*string{
			"API_URL":                 jsii.String("http://172.17.0.1:8081"),
			"APP_URL":                 jsii.String(appURL),
			"DYNAMODB_SESSIONS_TABLE": props.SessionsTable.TableName(),
			"AWS_REGION":              jsii.String("ap-northeast-1"),
		},
		Secrets: &map[string]awsecs.Secret{
			"COGNITO_DOMAIN":    awsecs.Secret_FromSsmParameter(props.CognitoDomainParam),
			"COGNITO_CLIENT_ID": awsecs.Secret_FromSsmParameter(props.CognitoClientIDParam),
		},
	})

	taskDef.AddContainer(jsii.String("DattiFrontendOtelCollector"), &awsecs.ContainerDefinitionOptions{
		ContainerName:  jsii.String("aws-otel-collector"),
		Image:          awsecs.ContainerImage_FromRegistry(jsii.String("amazon/aws-otel-collector:latest"), nil),
		Cpu:            jsii.Number(64),
		MemoryLimitMiB: jsii.Number(128),
		Essential:      jsii.Bool(false),
		Command:        jsii.Strings("--config=/etc/ecs/ecs-default-config.yaml"),
	})

	taskDef.AddContainer(jsii.String("DattiCloudflared"), &awsecs.ContainerDefinitionOptions{
		ContainerName:  jsii.String("cloudflared"),
		Image:          awsecs.ContainerImage_FromRegistry(jsii.String("cloudflare/cloudflared:latest"), nil),
		Cpu:            jsii.Number(64),
		MemoryLimitMiB: jsii.Number(128),
		Essential:      jsii.Bool(true),
		Command:        jsii.Strings("tunnel", "--no-autoupdate", "run"),
		Secrets: &map[string]awsecs.Secret{
			"TUNNEL_TOKEN": awsecs.Secret_FromSsmParameter(props.CloudflaredTokenParam),
		},
	})

	awsecs.NewEc2Service(scope, jsii.String("DattiFrontendService"), &awsecs.Ec2ServiceProps{
		ServiceName:       jsii.String(fmt.Sprintf("%s-datti-frontend", env)),
		Cluster:           cluster,
		TaskDefinition:    taskDef,
		DesiredCount:      jsii.Number(1),
		MinHealthyPercent: jsii.Number(0),
		MaxHealthyPercent: jsii.Number(100),
	})
}
