package stack

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type networkResources struct {
	Vpc           awsec2.IVpc
	SecurityGroup awsec2.ISecurityGroup
}

func newNetwork(scope constructs.Construct, env string) *networkResources {
	vpc := awsec2.NewVpc(scope, jsii.String("DattiVpc"), &awsec2.VpcProps{
		VpcName:     jsii.String(fmt.Sprintf("%s-datti-vpc", env)),
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
		SecurityGroupName: jsii.String(fmt.Sprintf("%s-datti-ecs-sg", env)),
		Description:       jsii.String("Security group for Datti ECS instances"),
		Vpc:               vpc,
		AllowAllOutbound:  jsii.Bool(true),
	})

	return &networkResources{
		Vpc:           vpc,
		SecurityGroup: sg,
	}
}
