package shared

import (
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecs"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

func newECSCluster(scope constructs.Construct, vpc awsec2.IVpc, sg awsec2.ISecurityGroup) awsecs.ICluster {
	cluster := awsecs.NewCluster(scope, jsii.String("DattiEcsCluster"), &awsecs.ClusterProps{
		ClusterName: jsii.String("datti-cluster"),
		Vpc:         vpc,
	})

	// EC2 Capacity (t4g.small, ARM, 1台)
	cluster.AddCapacity(jsii.String("DattiEcsCapacity"), &awsecs.AddCapacityOptions{
		InstanceType:             awsec2.InstanceType_Of(awsec2.InstanceClass_T4G, awsec2.InstanceSize_SMALL),
		MachineImage:             awsecs.EcsOptimizedImage_AmazonLinux2023(awsecs.AmiHardwareType_ARM, nil),
		DesiredCapacity:          jsii.Number(1),
		MinCapacity:              jsii.Number(1),
		MaxCapacity:              jsii.Number(1),
		VpcSubnets:               &awsec2.SubnetSelection{SubnetType: awsec2.SubnetType_PUBLIC},
		AssociatePublicIpAddress: jsii.Bool(true),
	})

	return cluster
}
