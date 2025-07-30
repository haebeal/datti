![Static Badge](https://img.shields.io/badge/https%3A%2F%2Fhaebeal.github.io%2Fdatti-api?label=OpenAPI&link=https%3A%2F%2Fhaebeal.github.io%2Fdatti-api)

# Datti API

誰にいくら払ったっけ？を記録するサービス

## ローカル開発手順
1. `task schema-gen`でスキーマファイルを生成する
   - `migrations/schema.sql`が生成される
2. `task schema-apply`でスキーマファイルをDBに適用させる
