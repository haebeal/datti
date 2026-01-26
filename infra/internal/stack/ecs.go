package stack

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecs"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type ecsProps struct {
	Vpc           awsec2.IVpc
	SecurityGroup awsec2.ISecurityGroup
}

type ecsResources struct {
	Cluster       awsecs.ICluster
	ExecutionRole awsiam.IRole
	TaskRole      awsiam.IRole
}

func newECS(scope constructs.Construct, env string, props *ecsProps) *ecsResources {
	// ECS Cluster
	cluster := awsecs.NewCluster(scope, jsii.String("DattiEcsCluster"), &awsecs.ClusterProps{
		ClusterName: jsii.String(fmt.Sprintf("%s-datti-cluster", env)),
		Vpc:         props.Vpc,
	})

	// Add EC2 Capacity to Cluster
	cluster.AddCapacity(jsii.String("DattiEcsCapacity"), &awsecs.AddCapacityOptions{
		InstanceType:             awsec2.InstanceType_Of(awsec2.InstanceClass_T4G, awsec2.InstanceSize_SMALL),
		MachineImage:             awsecs.EcsOptimizedImage_AmazonLinux2023(awsecs.AmiHardwareType_ARM, nil),
		DesiredCapacity:          jsii.Number(1),
		MinCapacity:              jsii.Number(1),
		MaxCapacity:              jsii.Number(1),
		VpcSubnets:               &awsec2.SubnetSelection{SubnetType: awsec2.SubnetType_PUBLIC},
		AssociatePublicIpAddress: jsii.Bool(true),
	})

	// Execution Role (for pulling images, logging)
	executionRole := awsiam.NewRole(scope, jsii.String("DattiEcsExecutionRole"), &awsiam.RoleProps{
		RoleName:  jsii.String(fmt.Sprintf("%s-datti-ecs-execution-role", env)),
		AssumedBy: awsiam.NewServicePrincipal(jsii.String("ecs-tasks.amazonaws.com"), nil),
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("service-role/AmazonECSTaskExecutionRolePolicy")),
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AmazonSSMReadOnlyAccess")),
		},
	})

	// Task Role (for application permissions)
	taskRole := awsiam.NewRole(scope, jsii.String("DattiEcsTaskRole"), &awsiam.RoleProps{
		RoleName:  jsii.String(fmt.Sprintf("%s-datti-ecs-task-role", env)),
		AssumedBy: awsiam.NewServicePrincipal(jsii.String("ecs-tasks.amazonaws.com"), nil),
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AmazonCognitoReadOnly")),
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AWSXRayDaemonWriteAccess")),
		},
	})

	// Log Groups
	awslogs.NewLogGroup(scope, jsii.String("DattiBackendLogGroup"), &awslogs.LogGroupProps{
		LogGroupName:  jsii.String(fmt.Sprintf("/ecs/%s-datti-backend", env)),
		Retention:     awslogs.RetentionDays_ONE_WEEK,
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
	})

	awslogs.NewLogGroup(scope, jsii.String("DattiFrontendLogGroup"), &awslogs.LogGroupProps{
		LogGroupName:  jsii.String(fmt.Sprintf("/ecs/%s-datti-frontend", env)),
		Retention:     awslogs.RetentionDays_ONE_WEEK,
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
	})

	return &ecsResources{
		Cluster:       cluster,
		ExecutionRole: executionRole,
		TaskRole:      taskRole,
	}
}
