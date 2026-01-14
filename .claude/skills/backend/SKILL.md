---
name: backend
description: Datti APIバックエンド開発ガイド。Go製PostgreSQL APIサーバーの開発、新機能実装、テスト、デプロイに関する標準フロー。契約定義、スキーマ設計、ユースケース実装時に自動的に使用。
---

# Datti Backend Development Skill

このスキルは、Datti API（Go製バックエンドAPI）の開発に必要な知識とワークフローを提供します。

エージェントが作業を始める前に必ずこのスキルを参照し、最新の情報源として維持してください。

## 概要

Datti APIは「誰にいくら払ったか」を記録・共有するサービスのバックエンドです。Go製APIサーバーで、PostgreSQLを使用してユーザー間の立て替え支払いを管理します。

## アーキテクチャ

詳細は [architecture.md](architecture.md) を参照。

クリーンアーキテクチャに基づいた層構造：

- **ドメイン層** (`internal/domain/`): ビジネスエンティティとリポジトリインターフェース
- **ユースケース層** (`internal/usecase/`): ビジネスロジック
- **ゲートウェイ層** (`internal/gateway/`): SQLCで生成されたデータベースクエリとリポジトリ実装
- **プレゼンテーション層** (`internal/presentation/api/`): HTTPハンドラー、oapi-codegenで生成された型とサーバースタブ

### ドメインコンセプト

- **Lending/Credit**: 支払者が債務者の費用を立て替えた記録
- **Payer**: 金額を支払ったユーザー
- **Debtor**: お金を借りているユーザー（個別金額を持つ）
- **Amount**: バリデーション付き金額のバリューオブジェクト（すべて円、整数扱い）

## 新機能実装フロー

ドメインを起点とし、内から外へ層を実装する標準フロー：

### 1. ドメインエンティティの定義

ビジネスの核となるドメインモデルを最初に定義します。

```bash
# internal/domain/ にエンティティ・値オブジェクトを作成
```

**実装内容**:
- 新しいエンティティ/値オブジェクト/ドメインサービスを `internal/domain/` に定義
- バリデーションロジックを実装
- 未確定事項は TODO として残し、テスト観点も併記する

**例**: `internal/domain/credit.go` のように、ビジネス概念をドメイン層に立てる

**コーディング規約**:
- コンストラクタ関数で生成（例: `NewUser`, `NewCredit`）
- イミュータブル（変更不可）
- バリデーションはコンストラクタで実行
- エラーは明示的に返却

**ドメインテスト**（ユーザーから指示があった場合のみ）:
```bash
# internal/domain/*_test.go にテストを追加
go test ./internal/domain/... -v
```

### 2. ユースケース実装（リポジトリインターフェース定義を含む）

ビジネスロジックを実装し、必要なリポジトリインターフェースを定義します。

**2.1 リポジトリインターフェース定義**

```bash
# internal/domain/ にリポジトリインターフェースを定義
# 例: internal/domain/credit_repository.go
```

- ドメイン層にリポジトリインターフェースを定義
- 永続化の詳細は含めず、ドメインの操作のみを表現
- モック生成の準備として `Taskfile.yaml` に mockgen 設定を追加（必要な場合）

**2.2 ユースケース実装**

```bash
# internal/usecase/ にビジネスロジックを実装
```

**実装のポイント**:
- リポジトリインターフェースを依存として受け取る
- 複数のリポジトリを組み合わせたオーケストレーション
- トランザクション管理（必要な場合）
- エラーハンドリングの統一
- OpenTelemetryトレース対応
- 例外ケースの挙動を明確にし、戻り値やエラー内容を統一する

**ユースケーステスト**（ユーザーから指示があった場合のみ）:
```bash
# モック生成
task gen-mocks

# テスト実装
# internal/usecase/*_test.go にテーブルドリブンテストを追加
go test ./internal/usecase/... -v
```

### 3. API定義（OpenAPI）

ユースケースの入出力をもとに、API契約を定義します。

```bash
# backend/openapi.yaml を編集
# OpenAPI 定義を更新
```

**実装内容**:
- ユースケースの入出力をもとに、エンドポイント・リクエスト・レスポンスを定義
- 適切な tags / summary / operationId を設定
- エラーハンドリングを含む完全な定義を作成
- 生成結果（OpenAPI YAML/JSON）を確認し、想定どおりかレビューする

**型とサーバーコード生成**:
```bash
task gen-api   # types.gen.go と server.gen.go を生成
```

- 生成された `types.gen.go` と `server.gen.go` を確認
- 生成された型名は`Namespace\Model\Name`の形式になる

### 4. ハンドラー実装

生成された型を使用して、ユースケースをHTTPエンドポイントとして公開します。

```bash
# internal/presentation/api/handler/ にハンドラーを実装
```

**実装内容**:
- ユースケースを依存として受け取る
- 生成されたリクエスト型を使用してパラメータを取得
- リクエストバリデーション
- 認証情報取得（`middleware.AuthMiddleware` からの `uid`）
- ユースケースの呼び出し
- レスポンス整形（ドメインモデル → 生成されたレスポンス型）
- エラーハンドリング
- 必ずビルドして型エラーがないことを確認

**サーバーへの統合**:
```bash
# internal/presentation/api/server/server.goを更新：
# - 新しいハンドラーをServerStructに追加
# - NewServer関数のパラメータに追加
# - 生成されたServerInterfaceのメソッドを実装
```

**ハンドラーテスト**（ユーザーから指示があった場合のみ）:
```bash
# internal/presentation/api/handler/*_test.go にテストを追加
go test ./internal/presentation/api/handler/... -v
```

### 5. リポジトリ実装（ゲートウェイとDBマイグレーションを含む）

永続化層を実装し、データベーススキーマを整備します。

**5.1 データベーススキーマ定義**

```bash
# backend/sql/schema.sql を編集
# テーブル定義を追加・更新
```

**5.2 SQLクエリ定義**

```bash
# backend/sql/query.sql を編集
# 必要なクエリを追加
```

**5.3 SQLC コード生成**

```bash
task gen-sqlc  # internal/gateway/postgres のコード生成
```

- 生成コードを確認し、`internal/gateway/postgres` の差分をチェック

**5.4 リポジトリ実装**

```bash
# internal/gateway/repository/ に実装を追加
```

**実装のポイント**:
- ドメイン層で定義したインターフェースを実装
- ドメインモデル ↔ データベースモデルの変換
- エラーハンドリングの統一
- OpenTelemetryトレース対応

**5.5 データベースマイグレーション**

```bash
task db-migrate  # Atlas経由でスキーマ適用
task db-seed     # サンプルデータ投入（必要な場合）
```

**5.6 DI統合**

```bash
# cmd/main.go でDI設定を更新
# リポジトリ → ユースケース → ハンドラー → サーバーの順に配線
```

- リポジトリの実装をユースケースに注入
- ユースケースをハンドラーに注入
- ハンドラーをサーバーに登録
- ルーティングを設定

### 6. ビルド確認

実装完了後、必ずビルドを実行してエラーがないことを確認します。

```bash
cd backend
go build -o ./tmp/bin ./cmd
```

### 避けるべきこと

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

## テスト方針

- **テスト実行はユーザーのリクエストがある場合のみ対応**
- testify（assert/require）を使用
- gomockでモック生成（`task gen-mocks`）

## 重要な実務ルール

### コード生成の管理

- **API定義後**: `backend/openapi.yaml` 変更 → `task gen-api`
- **SQL定義後**: `sql/schema.sql` や `sql/query.sql` 変更 → `task gen-sqlc` 実行
- **リポジトリインターフェース追加後**: `Taskfile.yaml` に mockgen 設定追加 → `task gen-mocks` 実行
- **生成物は元データと同じコミットに含める**

### 実装の順序

1. ドメインエンティティ定義
2. ユースケース実装（リポジトリインターフェース定義を含む）
3. API定義（OpenAPI）
4. ハンドラー実装
5. リポジトリ実装（ゲートウェイとDBマイグレーションを含む）
6. ビルド確認（`go build -o ./tmp/bin ./cmd`）

**実装は内から外へ進める**: ドメイン → ユースケース → API定義 → ハンドラー → リポジトリ → ビルド確認 の順を守る。

### コーディング規約

- **Go 1.24**: `gofmt` / `goimports` を必ず適用（タブインデント）
- **生成ファイル** (`*.gen.go`): 手動編集は禁止。生成元を更新しコマンドを再実行する
- **不変性**: ドメインエンティティはコンストラクタ関数で生成し不変
- **エラーハンドリング**: 明示的なエラー返却
- **バリデーション**: ドメインエンティティ作成時に実行

### 認証・環境

- **認証**: 現状ダミー実装（`middleware.AuthMiddleware` が `uid` を注入）
- **通貨**: すべて円（整数）
- **環境変数**: `backend/.env` 参照
- **トレース**: `APP_ENV=production` → Google Cloud Trace、その他 → OTLP HTTP

## ディレクトリと役割

- `backend/internal/domain`: ドメインモデル・値オブジェクト
- `backend/internal/gateway`: リポジトリ実装（SQLC 生成物を利用）
- `backend/internal/usecase`: アプリケーションユースケース
- `backend/internal/presentation/api`: oapi-codegen 生成物とハンドラー
- `backend/openapi.yaml`: OpenAPI 定義
- `backend/sql`: Atlas スキーマ、SQLC クエリ、初期データ
- `infra`: Terraform などのインフラ定義（現フェーズでは変更予定なし）

## 参考資料

- [architecture.md](architecture.md) - アーキテクチャの詳細
