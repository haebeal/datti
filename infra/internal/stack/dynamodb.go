package stack

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsdynamodb"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type dynamoDBResources struct {
	SessionsTable awsdynamodb.ITable
}

func newDynamoDB(scope constructs.Construct, env string) *dynamoDBResources {
	sessionsTable := awsdynamodb.NewTable(scope, jsii.String("DattiSessionsTable"), &awsdynamodb.TableProps{
		TableName:           jsii.String(fmt.Sprintf("%s-datti-sessions", env)),
		PartitionKey:        &awsdynamodb.Attribute{Name: jsii.String("sessionId"), Type: awsdynamodb.AttributeType_STRING},
		BillingMode:         awsdynamodb.BillingMode_PROVISIONED,
		ReadCapacity:        jsii.Number(5),
		WriteCapacity:       jsii.Number(5),
		TimeToLiveAttribute: jsii.String("expiresAt"),
		RemovalPolicy:       awscdk.RemovalPolicy_DESTROY,
	})

	return &dynamoDBResources{
		SessionsTable: sessionsTable,
	}
}
