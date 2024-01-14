package server_test

import (
	"sync"
	"testing"

	"github.com/datti-api/pkg/interface/api/server"
)

func TestServer(t *testing.T) {
	var wg sync.WaitGroup
	wg.Add(1)
	// テスト用のDSNを指定してください
	dsn := "host=localhost user=postgres password=root dbname=datti_db port=5432 sslmode=disable TimeZone=Asia/Tokyo"
	hostName := "localhost"
	dbInit := false
	go func() {
		server.Sever(dsn, hostName, dbInit)
		wg.Done()
	}()
}
