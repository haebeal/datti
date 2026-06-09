package env

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfront"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfrontorigins"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type WebResources struct {
	Bucket       awss3.IBucket
	Distribution awscloudfront.IDistribution
}

// newWeb Web フロントエンド (SPA) を S3 + CloudFront で配信するリソースを作成する。
// クライアントサイドルーティング (/groups 等) は CloudFront の 403/404 → /index.html リダイレクトで賄う。
func newWeb(scope constructs.Construct, env string) *WebResources {
	bucket := awss3.NewBucket(scope, jsii.String("DattiWebBucket"), &awss3.BucketProps{
		BucketName:        jsii.String(fmt.Sprintf("%s-datti-frontend", env)),
		RemovalPolicy:     awscdk.RemovalPolicy_DESTROY,
		AutoDeleteObjects: jsii.Bool(true),
		BlockPublicAccess: awss3.BlockPublicAccess_BLOCK_ALL(),
	})

	distribution := awscloudfront.NewDistribution(scope, jsii.String("DattiWebDistribution"), &awscloudfront.DistributionProps{
		DefaultRootObject: jsii.String("index.html"),
		DefaultBehavior: &awscloudfront.BehaviorOptions{
			Origin:               awscloudfrontorigins.S3BucketOrigin_WithOriginAccessControl(bucket, nil),
			ViewerProtocolPolicy: awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
			CachePolicy:          awscloudfront.CachePolicy_CACHING_OPTIMIZED(),
			Compress:             jsii.Bool(true),
		},
		ErrorResponses: &[]*awscloudfront.ErrorResponse{
			{
				HttpStatus:         jsii.Number(403),
				ResponseHttpStatus: jsii.Number(200),
				ResponsePagePath:   jsii.String("/index.html"),
				Ttl:                awscdk.Duration_Seconds(jsii.Number(0)),
			},
			{
				HttpStatus:         jsii.Number(404),
				ResponseHttpStatus: jsii.Number(200),
				ResponsePagePath:   jsii.String("/index.html"),
				Ttl:                awscdk.Duration_Seconds(jsii.Number(0)),
			},
		},
		Comment: jsii.String(fmt.Sprintf("Datti Web Frontend (%s)", env)),
	})

	return &WebResources{
		Bucket:       bucket,
		Distribution: distribution,
	}
}
