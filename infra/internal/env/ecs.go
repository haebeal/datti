package env

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type ECSResources struct {
	ExecutionRole awsiam.IRole
	TaskRole      awsiam.IRole
}

func newECS(scope constructs.Construct, env string) *ECSResources {
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
		LogGroupName:  jsii.String(fmt.Sprintf("/ecs/%s/datti-backend", env)),
		Retention:     awslogs.RetentionDays_ONE_WEEK,
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
	})

	awslogs.NewLogGroup(scope, jsii.String("DattiFrontendLogGroup"), &awslogs.LogGroupProps{
		LogGroupName:  jsii.String(fmt.Sprintf("/ecs/%s/datti-frontend", env)),
		Retention:     awslogs.RetentionDays_ONE_WEEK,
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
	})

	return &ECSResources{
		ExecutionRole: executionRole,
		TaskRole:      taskRole,
	}
}
