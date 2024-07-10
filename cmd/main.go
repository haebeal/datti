package main

import (
	"fmt"
	"os"

	"github.com/datti-api/pkg/interface/api/server"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Failed Load environment: %v", err)
	}

	// .envの DSNを取得して、messageに代入します。
	dsn := os.Getenv("DSN")
	hostName := os.Getenv("HOST_NAME")
	if err != nil {
		panic("failed to lodad .env DB_INIT")
	}
	server.Sever(dsn, hostName)
}
