package main

import (
	"fmt"
	"os"

	"github.com/datti-api/pkg/interface/api/server"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Printf("Failed Load environment: %v", err)
	}

	// .envの DSNを取得して、messageに代入します。
	dsn := os.Getenv("DSN")
	server.Sever(dsn)
}
