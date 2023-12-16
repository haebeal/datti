package database

import (
	"github.com/datti-api/pkg/domain/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DBEngine struct {
	Engine *gorm.DB
}

func NewDBEngine(dsn string) (*DBEngine, error) {
	// コネクションの生成
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// タイムゾーンの設定
	result := db.Exec("alter database datti_db set timezone to 'Asia/Tokyo'")
	if result.Error != nil {
		return nil, err
	}

	// マイグレーション
	db.AutoMigrate(&model.User{})

	return &DBEngine{Engine: db}, nil
}
