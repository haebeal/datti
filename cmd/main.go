package main

import (
	"github.com/datti-api/pkg/interface/api/server"
)

func main() {

	// クライアントの作成
	// ctx := context.Background()
	// client, err := secretmanager.NewClient(ctx)
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// // シークレットneon_dsnへのアクセス
	// resourceName := ""
	// req := &secretmanagerpb.AccessSecretVersionRequest{
	// 	Name: resourceName,
	// }

	// // シークレット上にアクセスする
	// result, err := client.AccessSecretVersion(ctx, req)
	// if err != nil {
	// 	log.Fatalf("failed to access secret version: %v", err)
	// }
	// dsn := *(*string)(unsafe.Pointer(&result.Payload.Data))
	// host=localhost user=postgres password=root dbname=datti_db port=5432 sslmode=disable TimeZone=Asia/Tokyo
	// localdsn := *flag.String("d", "", "database resource name")
	dsn := ""
	server.Sever(dsn)
}
