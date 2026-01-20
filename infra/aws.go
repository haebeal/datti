package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ec2"
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

	return nil
}
