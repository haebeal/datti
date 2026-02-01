package stack

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfront"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfrontorigins"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type s3Resources struct {
	AvatarBucket      awss3.IBucket
	AvatarDistribution awscloudfront.IDistribution
}

func newS3(scope constructs.Construct, env string) *s3Resources {
	// S3 Bucket for avatar images
	avatarBucket := awss3.NewBucket(scope, jsii.String("DattiAvatarBucket"), &awss3.BucketProps{
		BucketName:        jsii.String(fmt.Sprintf("%s-datti-avatar", env)),
		RemovalPolicy:     awscdk.RemovalPolicy_DESTROY,
		AutoDeleteObjects: jsii.Bool(true),
		BlockPublicAccess: awss3.BlockPublicAccess_BLOCK_ALL(),
	})

	// CloudFront Distribution
	avatarDistribution := awscloudfront.NewDistribution(scope, jsii.String("DattiAvatarDistribution"), &awscloudfront.DistributionProps{
		DefaultBehavior: &awscloudfront.BehaviorOptions{
			Origin:               awscloudfrontorigins.S3BucketOrigin_WithOriginAccessControl(avatarBucket, nil),
			ViewerProtocolPolicy: awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
			CachePolicy:          awscloudfront.CachePolicy_CACHING_OPTIMIZED(),
		},
		Comment: jsii.String(fmt.Sprintf("Datti Avatar CDN (%s)", env)),
	})

	return &s3Resources{
		AvatarBucket:       avatarBucket,
		AvatarDistribution: avatarDistribution,
	}
}
