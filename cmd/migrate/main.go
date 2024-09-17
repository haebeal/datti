package main

import (
	"fmt"
	"log"
	"os"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/joho/godotenv"
	"github.com/uptrace/bun"
)

// modelからスキーマ定義のSQL文字列 []byteに変換
func modelsToByte(db *bun.DB, models []interface{}) []byte {
	var data []byte

	for _, model := range models {
		query := db.NewCreateTable().Model(model).WithForeignKeys()

		rawQuery, err := query.AppendQuery(db.Formatter(), nil)
		if err != nil {
			log.Fatal(err)
		}

		data = append(data, rawQuery...)
		data = append(data, ";\n"...)
	}

	return data
}

// スキーマ定義SQLファイルschema.sqlを生成する
func main() {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Printf("Failed Load environment: %v", err)
	}

	dsn := os.Getenv("DSN")
	db, err := database.NewBunClient(dsn)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}

	models := []interface{}{
		(*model.User)(nil),
		(*model.Friend)(nil),
		(*model.Group)(nil),
		(*model.GroupUser)(nil),
		(*model.Event)(nil),
		(*model.Payment)(nil),
	}

	var data []byte
	data = append(data, modelsToByte(db.Client, models)...)

	os.WriteFile("./migrations/schema.sql", data, 0777)
}
