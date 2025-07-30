package main

import (
	"fmt"
	"os"

	"github.com/haebeal/datti/pkg/interface/api/server"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("../../.env")
	if err != nil {
		fmt.Printf("Failed Load environment: %v", err)
	}

	// .envの DSNを取得して、messageに代入します。
	dsn := os.Getenv("DSN")
	hostName := os.Getenv("HOST_NAME")

	server.Sever(dsn, hostName)
}
