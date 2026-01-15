---
name: backend
description: Datti APIバックエンド開発ガイド。Go製PostgreSQL APIサーバーの開発、新機能実装、テスト、デプロイに関する標準フロー。契約定義、スキーマ設計、ユースケース実装時に自動的に使用。
---

# Datti Backend Development Skill

このスキルは、Datti API（Go製バックエンドAPI）の開発に必要な知識とワークフローを提供します。

## アーキテクチャ

クリーンアーキテクチャに基づく4層構造：

| 層 | ディレクトリ | 責務 |
|---|---|---|
| ドメイン | `backend/internal/domain/` | エンティティ、値オブジェクト、リポジトリインターフェース |
| ユースケース | `backend/internal/usecase/` | ビジネスロジック、トランザクション管理 |
| ゲートウェイ | `backend/internal/gateway/` | リポジトリ実装、外部システム連携 |
| プレゼンテーション | `backend/internal/presentation/api/` | HTTPハンドラー、リクエスト/レスポンス処理 |

**依存の方向**: プレゼンテーション → ユースケース → ドメイン ← ゲートウェイ

### トレース

OpenTelemetryで各層にトレースを実装：

- **`APP_ENV=production`**: Google Cloud Trace
- **その他**: OTLP HTTP（ローカル: `http://localhost:4318`）

## 新機能実装フロー

ドメインを起点とし、内から外へ層を実装する標準フロー：

### 1. ドメインエンティティの定義

`backend/internal/domain/` にエンティティ・値オブジェクトを定義。

- コンストラクタ関数で生成（例: `NewUser`, `NewCredit`）
- イミュータブル、バリデーションはコンストラクタで実行
- エラーは明示的に返却

### 2. ユースケース実装（リポジトリインターフェース定義を含む）

- `backend/internal/domain/` にリポジトリインターフェースを定義
- `backend/internal/usecase/` にビジネスロジックを実装
- リポジトリインターフェースを依存として受け取る
- トランザクション管理、エラーハンドリングの統一

### 3. API定義（OpenAPI）

- `backend/openapi.yaml` を編集
- エンドポイント・リクエスト・レスポンスを定義
- `task gen-api` で型とサーバースタブを生成

### 4. ハンドラー実装

- `backend/internal/presentation/api/handler/` にハンドラーを実装
- ユースケースを依存として受け取る
- 認証情報取得（`middleware.AuthMiddleware` からの `uid`）
- レスポンス整形（ドメインモデル → 生成されたレスポンス型）
- `backend/internal/presentation/api/server/server.go` にハンドラーインターフェースを追加、`backend/cmd/main.go` でDI

### 5. リポジトリ実装（ゲートウェイとDBマイグレーション）

- `backend/sql/schema.sql` にテーブル定義
- `backend/sql/query.sql` にクエリ定義
- `task gen-sqlc` でコード生成
- `backend/internal/gateway/repository/` にリポジトリ実装
- `task db-migrate` でスキーマ適用
- `backend/cmd/main.go` でDI設定を更新

### 6. ビルド確認

`go vet ./...` でビルドエラーと静的解析を実行。

## 避けるべきこと

- **過度な設計**: 要求された機能以外の追加や改善を避ける
- **後方互換性ハック**: 未使用の変数名変更、型の再エクスポート、削除コードのコメントなど。不要なものは完全に削除する
- **早すぎる抽象化**: 1回限りの操作のためのヘルパーやユーティリティを作らない
- **不要なエラーハンドリング**: 発生しないシナリオの検証を追加しない。システム境界（ユーザー入力、外部API）でのみ検証する

## 開発コマンド

```bash
# データベース
task db-migrate    # Atlas経由でスキーマ適用
task db-seed       # サンプルデータ投入

# コード生成
task gen-sqlc      # SQLCでクエリコード生成
task gen-api       # OpenAPIから型とサーバースタブ生成
task gen-mocks     # モック生成

# テスト（ユーザーから明示的な指示があった場合のみ）
task test          # go test -race ./...
```

## 重要な実務ルール

### コード生成の管理

- **API定義後**: `backend/openapi.yaml` 変更 → `task gen-api`
- **SQL定義後**: `backend/sql/schema.sql` や `backend/sql/query.sql` 変更 → `task gen-sqlc` 実行
- **リポジトリインターフェース追加後**: `Taskfile.yaml` に mockgen 設定追加 → `task gen-mocks` 実行
- **生成物は元データと同じコミットに含める**

### コーディング規約

- **Go 1.24**: `gofmt` / `goimports` を必ず適用（タブインデント）
- **生成ファイル** (`*.gen.go`): 手動編集は禁止。生成元を更新しコマンドを再実行する
- **エラーハンドリング**: 明示的なエラー返却

### 認証・環境

- **認証**: Firebase Auth（`middleware.AuthMiddleware` が `uid` を注入）
- **通貨**: すべて円（整数）
- **環境変数**: `backend/.env` 参照

## 参考資料

### Context7 で最新ドキュメントを参照

ライブラリのAPIを確認する際は `use context7` を使用すること。LLMの学習データより新しい情報を取得できる。

対象ライブラリ:
- **sqlc** - クエリ構文、設定オプション
- **oapi-codegen** - OpenAPI生成設定
- **OpenTelemetry** - Go SDK トレースAPI

