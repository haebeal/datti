package main

import (
	"log"
	"os"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/infrastructure/database"
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
	db, err := database.NewBunClient("host=db user=postgres password=root dbname=datti_db port=5432 sslmode=disable TimeZone=Asia/Tokyo")
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}

	models := []interface{}{
		(*model.Friend)(nil),
		(*model.Group)(nil),
		(*model.GroupUser)(nil),
		(*model.Event)(nil),
		(*model.Payment)(nil),
	}

	var data []byte
	data = append(data, modelsToByte(db.Client, models)...)

	os.WriteFile("./pkg/infrastructure/database/migrations/schema.sql", data, 0777)
}
