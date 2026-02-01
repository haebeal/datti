package shared

import (
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type NetworkResources struct {
	Vpc           awsec2.IVpc
	SecurityGroup awsec2.ISecurityGroup
}

func newNetwork(scope constructs.Construct) *NetworkResources {
	vpc := awsec2.NewVpc(scope, jsii.String("DattiVpc"), &awsec2.VpcProps{
		VpcName:     jsii.String("datti-vpc"),
		IpAddresses: awsec2.IpAddresses_Cidr(jsii.String("10.0.0.0/16")),
		MaxAzs:      jsii.Number(1),
		NatGateways: jsii.Number(0),
		SubnetConfiguration: &[]*awsec2.SubnetConfiguration{
			{
				Name:       jsii.String("public"),
				SubnetType: awsec2.SubnetType_PUBLIC,
				CidrMask:   jsii.Number(24),
			},
		},
	})

	sg := awsec2.NewSecurityGroup(scope, jsii.String("DattiSecurityGroup"), &awsec2.SecurityGroupProps{
		SecurityGroupName: jsii.String("datti-ecs-sg"),
		Description:       jsii.String("Security group for Datti ECS instances"),
		Vpc:               vpc,
		AllowAllOutbound:  jsii.Bool(true),
	})

	return &NetworkResources{
		Vpc:           vpc,
		SecurityGroup: sg,
	}
}
