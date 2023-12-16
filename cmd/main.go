package main

import (
	"flag"

	"github.com/datti-api/pkg/interface/api/server"
)

func main() {
	dsn := flag.String("d", "host=localhost user=postgres password=root dbname=datti_db port=5432 sslmode=disable TimeZone=Asia/Tokyo", "database resource name")
	server.Sever(*dsn)
}
