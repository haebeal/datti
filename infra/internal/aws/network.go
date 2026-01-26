package aws

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/ec2"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type networkOutput struct {
	subnetID pulumi.IDOutput
	sgID     pulumi.IDOutput
}

func createNetworkResources(ctx *pulumi.Context) (*networkOutput, error) {
	////////////////////////////////
	// VPC
	////////////////////////////////
	vpc, err := ec2.NewVpc(ctx, "datti-vpc", &ec2.VpcArgs{
		CidrBlock:          pulumi.String("10.0.0.0/16"),
		EnableDnsHostnames: pulumi.Bool(true),
		EnableDnsSupport:   pulumi.Bool(true),
		Tags: pulumi.StringMap{
			"Name": pulumi.String("datti-vpc"),
		},
	})
	if err != nil {
		return nil, err
	}

	////////////////////////////////
	// VPC
	// NOTE: アウトバウンドのみ許可するように
	////////////////////////////////
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
		return nil, err
	}

	////////////////////////////////
	// パブリックサブネット
	////////////////////////////////
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
		return nil, err
	}

	////////////////////////////////
	// インターネットゲートウェイ
	////////////////////////////////
	igw, err := ec2.NewInternetGateway(ctx, "datti-igw", &ec2.InternetGatewayArgs{
		VpcId: vpc.ID(),
		Tags: pulumi.StringMap{
			"Name": pulumi.String("datti-igw"),
		},
	})
	if err != nil {
		return nil, err
	}

	////////////////////////////////
	// ルートテーブル
	////////////////////////////////
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
		return nil, err
	}

	////////////////////////////////
	// サブネットとルートテーブルを紐付け
	////////////////////////////////
	_, err = ec2.NewRouteTableAssociation(ctx, "datti-rta", &ec2.RouteTableAssociationArgs{
		SubnetId:     subnet.ID(),
		RouteTableId: rt.ID(),
	})
	if err != nil {
		return nil, err
	}

	return &networkOutput{
		subnetID: subnet.ID(),
		sgID:     sg.ID(),
	}, nil
}
