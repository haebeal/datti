# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

Datti APIは「誰にいくら払ったか」を記録・共有するサービスのバックエンドです。Go製APIサーバーで、PostgreSQLを使用してユーザー間の立て替え支払いを管理します。

## リポジトリ構成

- `apps/backend`: Go製APIサーバー本体
- `docs/openapi`: TypeSpecによるAPI契約定義と生成されたOpenAPI仕様
- `infra`: Terraformによるインフラ構成管理
- `.devcontainer`: VS Code Dev Container用設定

## アーキテクチャ

バックエンドはクリーンアーキテクチャに基づいた層構造：

- **ドメイン層** (`internal/domain/`): ビジネスエンティティ（User、Credit、Lending、Payer、Debtor、Amount）とリポジトリインターフェース
- **ユースケース層** (`internal/usecase/`): ビジネスロジックとオーケストレーション
- **ゲートウェイ層** (`internal/gateway/`):
  - `postgres/`: SQLCで生成されたデータベースクエリ
  - `repository/`: ドメインインターフェースの実装
- **プレゼンテーション層** (`internal/presentation/api/`): HTTPハンドラー、oapi-codegenで生成された型とサーバースタブ

### データモデル

- **users**: ユーザープロフィール（UUID主キー）
- **events**: 立て替えイベント（ULID形式のTEXT主キー）
- **payments**: イベント・支払者・債務者の関係（多対多）

### ドメインコンセプト

- **Lending/Credit**: 支払者が債務者の費用を立て替えた記録
- **Payer**: 金額を支払ったユーザー
- **Debtor**: お金を借りているユーザー（個別金額を持つ）
- **Amount**: バリデーション付き金額のバリューオブジェクト（すべて円、整数扱い）

## セットアップ

### 必要なツール

| ツール | インストール例 |
| --- | --- |
| Docker / Docker Compose | `brew install --cask docker` |
| Go 1.24.x | `brew install go` |
| [Task](https://taskfile.dev) | `brew install go-task/tap/go-task` |
| [godotenv](https://github.com/joho/godotenv) | `go install github.com/joho/godotenv/cmd/godotenv@latest` |
| [sqlc](https://docs.sqlc.dev) | `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest` |
| [air](https://github.com/air-verse/air) | `go install github.com/air-verse/air@latest` |
| [Atlas](https://atlasgo.io/docs) | `brew install ariga/tap/atlas` |
| [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen) | `go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest` |
| [mockgen](https://github.com/uber-go/mock) | `go install go.uber.org/mock/mockgen@latest` |
| [dlv](https://github.com/go-delve/delve) | `go install github.com/go-delve/delve/cmd/dlv@latest` |
| psql | `brew install postgresql` |

### 初回セットアップ

```bash
# 1. コンテナ起動（Postgres & Jaeger）
docker compose up

# 2. バックエンドディレクトリで依存関係取得
cd apps/backend
go mod download

# 3. 環境変数設定
cp .env.example .env
# 必要に応じて .env を編集

# 4. マイグレーション & 初期データ投入
task db-migrate
task db-seed
```

### ローカル開発

```bash
cd apps/backend

# ホットリロード開発サーバー起動（デバッグポート :2345）
air
```

## 開発コマンド

### バックエンド開発（apps/backend）

```bash
# データベース
task db-migrate    # Atlas経由でスキーマ適用
task db-seed       # サンプルデータ投入

# コード生成
task gen-sqlc      # SQLCでクエリコード生成（sql/query.sql → internal/gateway/postgres）
task gen-types     # OpenAPIからリクエスト/レスポンス型生成（→ internal/presentation/api/types.gen.go）
task gen-server    # OpenAPIからサーバースタブ生成（→ internal/presentation/api/server.gen.go）
task gen-mocks     # モック生成（→ internal/usecase/test, internal/presentation/api/handler/test）

# テスト
task test          # go test -race ./...

# 単体テスト実行
go test ./internal/domain/... -v
go test ./internal/usecase/... -v
go test ./internal/presentation/... -v
```

### TypeSpec/OpenAPI（docs/openapi）

```bash
cd docs/openapi

npm run compile         # TypeSpec → OpenAPI生成
npm run compile:watch   # ファイル監視モード
npm run format          # TypeSpecファイルのフォーマット
```

## 新機能実装フロー

TypeSpecを契約の起点とし、外から内へ層を実装する標準フロー：

### 1. TypeSpec実装と検証

```bash
cd docs/openapi

# TypeSpecファイルを編集（例: lendings.tsp, credits.tsp）
# main.tspにインポートを追加（必要な場合）

npm run compile  # OpenAPI生成
# tsp-output/@typespec/openapi3/openapi.yaml を確認
```

### 2. プレゼンテーション層の生成

```bash
cd apps/backend

task gen-types    # types.gen.go 生成
task gen-server   # server.gen.go 生成
# 生成されたインターフェースとエンドポイントを確認
```

### 3. ドメインモデリング

- 新しいエンティティ/値オブジェクトを `internal/domain/` に定義
- リポジトリインターフェースをドメイン層に定義
- バリデーションロジックを実装

### 4. 永続化モデルの準備

```bash
# スキーマ更新
# apps/backend/sql/schema.sql を編集

# クエリ追加
# apps/backend/sql/query.sql を編集

task gen-sqlc  # internal/gateway/postgres のコード生成
```

### 5. リポジトリ層の実装

- `internal/gateway/repository/` にドメインインターフェースの実装を追加
- OpenTelemetryのトレース対応を含める

### 6. ユースケース実装

- `internal/usecase/` にビジネスロジックを実装
- 入出力DTOはプレゼンテーション層（`internal/presentation/api/handler/`）で定義
- 出力は可能な限りドメインエンティティを保持し、プレゼンテーション層で整形

### 7. ユースケーステスト

```bash
# モック更新（必要な場合）
task gen-mocks

# テスト実装
# internal/usecase/*_test.go にテーブルドリブンテストを追加
```

### 8. ハンドラー実装

- `internal/presentation/api/handler/` にハンドラーを実装
- 生成された型とインターフェースに沿う
- リクエスト検証・認証情報取得・レスポンス整形を実装

### 9. ハンドラーテスト

- `internal/presentation/api/handler/*_test.go` にテストを追加

### 10. DI・総合検証

```bash
# cmd/main.go でDI設定を更新
# リポジトリ → ユースケース → ハンドラー → サーバーの順に配線

task test  # 全テスト実行
```

## テスト方針

### テストフレームワーク

- **testify**: 統一されたアサーションスタイル
  - `assert`: 失敗してもテスト継続
  - `require`: 失敗時に即座にテスト停止
- **gomock**: モック生成（`task gen-mocks`）

### テスト実装パターン

```go
func TestExample(t *testing.T) {
    // require: 前提条件の検証
    user, err := domain.NewUser("id", "name", "avatar", "email")
    require.NoError(t, err)
    require.NotNil(t, user)

    // assert: 結果の検証
    assert.Equal(t, "name", user.Name())
}

// モックを使ったテスト
func TestUseCase_Success(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()

    mockRepo := testutil.NewMockRepository(ctrl)
    mockRepo.EXPECT().Method(gomock.Any()).Return(result, nil)

    // テスト実行...
}
```

## 重要な実務ルール

実際の実装に差し掛かる際には、Codex MCPを使用してください。
オプションとして、
workspace には、 workspace-write を
approval-policy には、 never を
つけて、Codex MCPを使用してください。
また、Codexに振るタスクは細分化して、細かく投げて、進捗を追いやすくしてください。

### コード生成の管理

- **TypeSpec変更時**: `npm run compile` → `task gen-types` → `task gen-server` を順に実行
- **SQL変更時**: `task gen-sqlc` 実行
- **インターフェース追加時**: `Taskfile.yaml` にmockgen設定を追加し `task gen-mocks` 実行
- **生成物は元データと同じコミットに含める**

### 実装の順序

1. 契約定義（TypeSpec） → 検証
2. ドメインモデル → リポジトリインターフェース
3. リポジトリ実装
4. ユースケース実装 → テスト
5. ハンドラー実装 → テスト
6. DI統合 → 総合検証

### コーディング規約

- **Go 1.24**: `gofmt` / `goimports` を適用（タブインデント）
- **生成ファイル** (`*.gen.go`): 手動編集禁止
- **不変性**: ドメインエンティティはコンストラクタ関数で生成し不変
- **エラーハンドリング**: 明示的なエラー返却
- **バリデーション**: ドメインエンティティ作成時に実行

### 認証・環境

- **認証**: 現状ダミー実装（`middleware.AuthMiddleware` が `uid` を注入）
- **通貨**: すべて円（整数）
- **環境変数**: `apps/backend/.env` 参照（機微情報は含めない）
- **トレース**:
  - `APP_ENV=production`: Google Cloud Trace
  - その他: OTLP HTTP（ローカルは `http://localhost:4318`）

## 主要な依存関係

- **Echo v4**: HTTPフレームワーク
- **pgx/v5**: PostgreSQLドライバー
- **SQLC**: タイプセーフなSQLコード生成
- **oapi-codegen**: OpenAPI型・サーバー生成
- **gomock**: モック生成
- **OpenTelemetry**: トレース・メトリクス

## 環境変数

| 変数名 | 説明 |
| --- | --- |
| `APP_ENV` | 環境（production/その他）。トレースエクスポーター切り替えに使用 |
| `PORT` | APIサーバーのポート番号 |
| `DSN` | Postgres接続文字列。例: `postgres://postgres:password@localhost:5432/datti?sslmode=disable` |
| `OTEL_SERVICE_NAME` | OpenTelemetryのサービス名 |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | Jaeger等のエンドポイント（APP_ENV != production時） |
| `OTEL_EXPORTER_OTLP_TRACES_INSECURE` | TLS不使用の場合 `true` |

## ドキュメント

- **OpenAPI仕様**: `docs/openapi/tsp-output/@typespec/openapi3/openapi.yaml`
- **公開ドキュメント**: https://haebeal.github.io/datti-api
- **AGENTS.md**: エージェント向けの詳細な作業手順書（作業開始前に必ず確認）
