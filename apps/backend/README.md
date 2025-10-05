![Static Badge](https://img.shields.io/badge/https%3A%2F%2Fhaebeal.github.io%2Fdatti-api?label=OpenAPI&link=https%3A%2F%2Fhaebeal.github.io%2Fdatti-api)

# Datti API

誰にいくら払ったかを記録・共有するサービス

## 必要なツール
| ツール | 推奨バージョン | インストール例 |
| --- | --- | --- |
| Go | 1.24.x | `brew install go` |
| [Task](https://taskfile.dev) | 最新 | `brew install go-task/tap/go-task` |
| [sqlc](https://docs.sqlc.dev) | 最新 | `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest` |
| [air](https://github.com/air-verse/air) | 最新 | `go install github.com/air-verse/air@latest` |
| psql | 15 以上 | `brew install postgresql` |
| [Atlas](https://atlasgo.io/docs) | 最新 | `brew install ariga/tap/atlas` |
| [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen) | 最新 | `go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest` |
| [mockgen](https://github.com/uber-go/mock) | 最新 | `go install go.uber.org/mock/mockgen@latest` |

## 環境変数
`.env.example` を複製して `.env` を作成し、必要に応じて値を変更してください。Task は `.env` を自動で読み込みます。

| 変数名 | 説明 |
| --- | --- |
| `PORT` | API サーバーが待ち受けるポート番号 |
| `DSN` | Postgres 接続文字列。例: `postgres://postgres:password@localhost:5432/datti?sslmode=disable` |
| `OTEL_SERVICE_NAME` など | OpenTelemetry のエクスポート設定。ローカルで Traces を送る場合は Collector を起動してください |

## セットアップ手順
1. Postgres, Jaegerの起動
   ```bash
   cd .devcontainer
   docker compose up
   ```
2. マイグレーション & 初期データ投入
   ```bash
   cd apps/backend
   task db-migrate
   task db-seed
   ```

## ローカル開発
- API サーバーの起動
  ```bash
  cd apps/backend
  air
  ```

## 利用可能な Task 一覧
| タスク | 内容 |
| --- | --- |
| `task db-migrate` | Atlas 経由で Postgres スキーマを適用 |
| `task db-seed` | サンプルデータを投入 |
| `task gen-sqlc` | `sql/query.sql` から `internal/gateway/postgres` のクエリコードを生成 |
| `task gen-types` | OpenAPI からリクエスト/レスポンス型を生成 |
| `task gen-server` | OpenAPI からサーバースタブを生成 |
| `task gen-mocks` | モックを生成 |
| `task test` | テストの実行 |

