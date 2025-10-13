![Static Badge](https://img.shields.io/badge/https%3A%2F%2Fhaebeal.github.io%2Fdatti-api?label=OpenAPI&link=https%3A%2F%2Fhaebeal.github.io%2Fdatti-api)

# Datti API

誰にいくら払ったかを記録・共有するサービス

## リポジトリ構成
- `apps/backend`: Go 製 API サーバー本体。Taskfile やスキーマ、OpenAPI 生成物を含む
- `docs`: TypeSpec から生成された OpenAPI などドキュメント類
- `infra`: Terraform などインフラ構成管理
- `.devcontainer`: VS Code Dev Container 用設定と Dockerfile

## 必要なツール
| ツール | 推奨バージョン | インストール例 |
| --- | --- | --- |
| Docker / Docker Compose | 24.x / v2 系 | `brew install --cask docker` |
| Go | 1.24.x | `brew install go` |
| [Task](https://taskfile.dev) | 最新 | `brew install go-task/tap/go-task` |
| [godotenv](https://github.com/joho/godotenv) | 最新 | `go install github.com/joho/godotenv/cmd/godotenv@latest` |
| [sqlc](https://docs.sqlc.dev) | 最新 | `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest` |
| [air](https://github.com/air-verse/air) | 最新 | `go install github.com/air-verse/air@latest` |
| psql | 15 以上 | `brew install postgresql` |
| [Atlas](https://atlasgo.io/docs) | 最新 | `brew install ariga/tap/atlas` |
| [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen) | 最新 | `go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest` |
| [mockgen](https://github.com/uber-go/mock) | 最新 | `go install go.uber.org/mock/mockgen@latest` |
| [dlv](https://github.com/go-delve/delve) | 最新 | `go install github.com/go-delve/delve/cmd/dlv@latest` |

## 環境変数
`apps/backend/.env.example` を複製して `.env` を作成し、必要に応じて値を変更してください。Task は `.env` を自動で読み込みます。

| 変数名 | 説明 |
| --- | --- |
| `PORT` | API サーバーが待ち受けるポート番号 |
| `DSN` | Postgres 接続文字列。例: `postgres://postgres:password@localhost:5432/datti?sslmode=disable` |
| `OTEL_SERVICE_NAME` | OpenTelemetry のサービス名。例: `Datti API` |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | Jaeger Collector 等へのエンドポイント。例: `http://localhost:4318` |
| `OTEL_EXPORTER_OTLP_TRACES_INSECURE` | Collector への接続に TLS を使わない場合は `true` |

Jaeger にトレースを送信する場合は Collector を起動した上で上記エンドポイントを指定してください。

## セットアップ手順
1. コンテナ群の起動（リポジトリ直下の `compose.yaml` を利用）
   ```bash
   docker compose up
   ```
   - Postgres: `localhost:5432`
   - Jaeger UI: `http://localhost:16686`
2. マイグレーション & 初期データ投入
   ```bash
   cd apps/backend
   go mod download
   task db-migrate
   task db-seed
   ```

## ローカル開発
- API サーバーの起動
  ```bash
  cd apps/backend
  air
  ```
  - `.air.toml` が `godotenv` と `dlv` を介してバイナリを起動します（デバッグポート :2345）
  - ソース変更を監視し自動ビルド・再起動が行われます

## 利用可能な Task 一覧
| タスク | 内容 |
| --- | --- |
| `task db-migrate` | Atlas 経由で Postgres スキーマを適用 |
| `task db-seed` | サンプルデータを投入 |
| `task gen-sqlc` | `sql/query.sql` から `internal/gateway/postgres` のクエリコードを生成 |
| `task gen-types` | OpenAPI からリクエスト/レスポンス型を生成（出力: `internal/presentation/api/types.gen.go`） |
| `task gen-server` | OpenAPI からサーバースタブを生成（出力: `internal/presentation/api/server.gen.go`） |
| `task gen-mocks` | モックを生成（出力: `internal/usecase/test` など） |
| `task test` | テストの実行 |

OpenAPI の元定義は `docs/openapi/tsp-output/@typespec/openapi3/openapi.yaml` に配置されています。
