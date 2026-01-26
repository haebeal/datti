package aws

import (
	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws/dynamodb"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type dynamoDBOutput struct {
	sessionsTableName pulumi.StringOutput
	sessionsTableARN  pulumi.StringOutput
}

func createDynamoDB(ctx *pulumi.Context) (*dynamoDBOutput, error) {
	// セッション管理用DynamoDBテーブル
	sessionsTable, err := dynamodb.NewTable(ctx, "datti-sessions-dev", &dynamodb.TableArgs{
		Name:        pulumi.String("datti-sessions-dev"),
		BillingMode: pulumi.String("PAY_PER_REQUEST"),

		// パーティションキー
		HashKey: pulumi.String("sessionId"),
		Attributes: dynamodb.TableAttributeArray{
			&dynamodb.TableAttributeArgs{
				Name: pulumi.String("sessionId"),
				Type: pulumi.String("S"),
			},
		},

		// TTL設定（expiresAt属性でUnix秒を指定）
		Ttl: &dynamodb.TableTtlArgs{
			Enabled:       pulumi.Bool(true),
			AttributeName: pulumi.String("expiresAt"),
		},

		Tags: pulumi.StringMap{
			"Environment": pulumi.String("dev"),
			"Application": pulumi.String("datti"),
		},
	})
	if err != nil {
		return nil, err
	}

	return &dynamoDBOutput{
		sessionsTableName: sessionsTable.Name,
		sessionsTableARN:  sessionsTable.Arn,
	}, nil
}
