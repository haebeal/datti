# bunのスクリプトからschema.sqlを生成
generate-schema:
	go run ./pkg/infrastructure/database/migrations/generate.go

# スキーマからマイグレーションファイルを生成
generate-migration:
	atlas migrate diff migration \
		--dir 'file://pkg/infrastructure/database/migrations?format=golang-migrate' \
		--to 'file://pkg/infrastructure/database/migrations/schema.sql' \
		--dev-url 'postgres://atlas:5432/atlas_db?search_path=public&user=postgres&password=root&sslmode=disable'

# マイグレーションのバージョンアップ
migrate:
	migrate --path ./pkg/infrastructure/database/migrations --database 'postgresql://db:5432/datti_db?search_path=public&user=postgres&password=root&sslmode=disable' -verbose up

# マイグレーションのバージョンダウン
migrate-rollback:
	migrate --path ./pkg/infrastructure/database/migrations --database 'postgresql://db:5432/datti_db?search_path=public&user=postgres&password=root&sslmode=disable' -verbose down 1

# マイグレーションの強制
# エラー： Dirty database version <バージョン番号>. Fix and force version. が発生した場合に非コメントアウトして使用する
# -verbose focr <バージョン番号> でバージョン番号を指定してデータベースの状態を戻す
# migrate-force:
# 	migrate --path 'pkg/infrastructure/database/migrations' --database 'postgresql://postgres:root@db:5432/datti_db?sslmode=disable&search_path=public' -verbose force 20240709143329

# マイグレーションのバージョンを確認
migrate-version:
	migrate --path 'pkg/infrastructure/database/migrations' --database 'postgresql://postgres:root@db:5432/datti_db?sslmode=disable&search_path=public' -verbose version

# マイグレーションファイルの値をハッシュ値として保存
migrate-hash:
	atlas migrate hash --dir 'file://pkg/infrastructure/database/migrations'

# スキーマの生成からマイグレーションを実行
auto-migrate:
	make migrate-hash
	make generate-schema
	make generate-migration
	make migrate
