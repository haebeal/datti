package database_test

import (
	"testing"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/infrastructure/database"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestNewDBEngin(t *testing.T) {
	// テスト用のDSNを設定
	testDSN := "host=localhost user=postgres password=root dbname=datti_db port=5432 sslmode=disable TimeZone=Asia/Tokyo"

	// テスト用のDBEngineを生成
	dbEngine, err := database.NewDBEngine(testDSN)
	if err != nil {
		t.Fatalf("Error creating DBEngine: %v", err)
	}

	// DBEngineがnilでないことを確認
	if dbEngine == nil {
		t.Fatal("DBEngine is nil")
	}
	// Engineがnilでないことを確認
	if dbEngine.Engine == nil {
		t.Fatal("DBEngine.Engine is nil")
	}
}

func TestInitDB(t *testing.T) {
	// 正常系
	dsn := "host=localhost user=postgres password=root dbname=datti_db port=5432 sslmode=disable TimeZone=Asia/Tokyo"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("Error creating DBEgine %v", err)
	}

	resultDB, err := database.InitDB(db)
	if err != nil {
		t.Fatalf("Error initializing test database: %v", err)
	}

	var timeZone string
	result := resultDB.Raw("SHOW timezone").Scan(&timeZone)
	if result.Error != nil {
		t.Fatalf("Error getting timezone: %v", result.Error)
	}
	if timeZone != "Asia/Tokyo" {
		t.Fatalf("Unexpected timezone: got %s, expected Asia/Tokyo", timeZone)
	}

	// ユーザーテーブルが存在することを確認
	hasTable := resultDB.Migrator().HasTable(&model.User{})
	if !hasTable {
		t.Fatal("User table does not exist")
	}
}
