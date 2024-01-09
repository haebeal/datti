package database

import (
	"github.com/datti-api/pkg/domain/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DBEngine struct {
	Engine *gorm.DB
}

func NewDBEngine(dsn string, dbInit bool) (*DBEngine, error) {
	// コネクションの生成
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	exists := db.Migrator().HasTable(&model.User{})

	// 環境変数により初期化の実施を行う
	if (exists && dbInit) || (!exists && dbInit) || (!exists && !dbInit) {
		// 初期化関数の呼び出し
		db, err = InitDB(db)
		if err != nil {
			return nil, err
		}
	}

	return &DBEngine{Engine: db}, nil
}

// DBの初期化関数
func InitDB(db *gorm.DB) (*gorm.DB, error) {
	// タイムゾーンの設定
	result := db.Exec("alter database datti_db set timezone to 'Asia/Tokyo'")
	if result.Error != nil {
		return nil, result.Error
	}
	// テーブルの削除
	if err := db.Migrator().DropTable(&model.User{}); err != nil {
		return nil, err
	}
	// テーブルのマイグレーション
	db.AutoMigrate(&model.User{})

	return db, nil
}
