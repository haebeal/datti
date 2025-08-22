# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

Datti APIバックエンドは「誰にいくら払ったっけ？」を記録するサービスのGoバックエンドです。PostgreSQLを使用してユーザー間の支払いイベントを管理します。

## アーキテクチャ

クリーンアーキテクチャに基づいて関心の分離を明確にしています：

- **ドメイン層** (`internal/domain/`): コアのビジネスエンティティ（User、PaymentEvent、Payer、Debtor、Amount）とバリデーションロジック、リポジトリインターフェース
- **ユースケース層** (`internal/usecase/`): アプリケーションのビジネスロジックとオーケストレーション
- **ゲートウェイ層** (`internal/gateway/`): 外部連携
  - `postgres/`: SQLCで生成されたデータベースクエリとモデル
  - `repository/`: ドメインインターフェースの実装
- **プレゼンテーション層** (`internal/presentation/api/`): HTTPハンドラーとOpenAPIで生成された型

### 主要なドメインコンセプト

- **PaymentEvent**: 1人の支払者が複数の債務者の費用を立て替えた支払いイベント
- **Payer**: 金額を支払ったユーザー
- **Debtor**: お金を借りているユーザー（個別の金額を持つ）
- **Amount**: 金額のバリデーション付きバリューオブジェクト
- ドメインエンティティはUserにUUID、PaymentEventにULIDを使用

## 開発コマンド

### コード生成
```bash
# SQLCデータベースコードの生成
task gen-sqlc

# TypeSpecからOpenAPI型を生成 (../../docs/openapi/から生成)
task gen-type

# OpenAPIサーバーコードを生成
task gen-server

# OpenAPIクライアントコードを生成（必要に応じて）
task gen-client
```

### データベース管理
```bash
# Atlasを使用してデータベーススキーマを適用
task migrate-db
```

### アプリケーション実行
```bash
# メインアプリケーションを実行
go run cmd/main.go
```

## API仕様

OpenAPI仕様は親ディレクトリの `../../docs/openapi/` のTypeSpecで定義されています。
生成されたOpenAPI仕様は `../../docs/openapi/tsp-output/@typespec/openapi3/openapi.yaml` にあります

## データベーススキーマ

- **users**: ユーザープロフィール（UUID主キー）
- **events**: 支払いイベント（ULIDを使用したTEXT主キー）
- **payments**: イベントと債務者ユーザー間の多対多関係

## 主要な依存関係

- **Echo v4**: HTTPフレームワーク
- **pgx/v5**: PostgreSQLドライバー
- **SQLC**: タイプセーフなSQLコード生成
- **ULID**: 辞書順でソート可能なユニークID
- **UUID**: ユーザー識別用
- **GoTrue**: Supabase認証（インポートされているが現在未使用）

## テスト

### テストフレームワーク

プロジェクト全体でtestifyライブラリを使用した統一されたテストスタイルを採用しています。

### テストスタイル

- **testifyライブラリの使用**: `github.com/stretchr/testify`を全テストファイルで統一
- **assertパッケージ**: 一般的なアサーション（`assert.Equal`, `assert.NotNil`, `assert.Error`など）
- **requireパッケージ**: テスト継続が不可能な場合の早期終了（`require.NoError`, `require.NotNil`など）
- **読みやすさ重視**: 従来の`t.Errorf`より簡潔で分かりやすい記述

### テスト実装例

```go
func TestExample(t *testing.T) {
    // require: 失敗時にテストを即座に停止
    user, err := domain.NewUser("valid-id", "name", "avatar", "email")
    require.NoError(t, err, "Failed to create user")
    require.NotNil(t, user)

    // assert: 失敗してもテストを継続
    assert.Equal(t, "name", user.Name())
    assert.NotEmpty(t, user.ID())
}
```

### 各層のテストカバレッジ

- **ドメイン層**: エンティティの作成、バリデーション、メソッドの動作確認
  - `amount_test.go`, `paymentEvent_test.go`, `user_test.go`
- **ユースケース層**: ビジネスロジック、リポジトリとの連携、エラーハンドリング
  - `payment_test.go`（モックリポジトリ使用）
- **プレゼンテーション層**: HTTPハンドラー、リクエスト/レスポンス処理、エラーハンドリング
  - `handler/payment_test.go`, `server/server_test.go`（モックハンドラー使用）

### モックの活用

- **ユースケース層**: カスタムモックリポジトリでデータベース依存を排除
- **プレゼンテーション層**: モックハンドラーで各層の責務を分離したテスト
- **テストの独立性**: 各層が他の層の実装に依存しないテスト設計

### テスト実行

```bash
# 全テスト実行
go test ./...

# 特定の層のテスト実行
go test ./internal/domain/... -v
go test ./internal/usecase/... -v
go test ./internal/presentation/... -v
```

## 開発環境

アプリケーションは以下を想定しています：
- PostgreSQLデータベース： `postgres://postgres:password@postgres:5432/datti`
- サーバーはポート7070で動作
- 環境変数DSNとPORTは開発用にハードコードされた値を優先してコメントアウト

## 新しいエンドポイント実装手順

新しいAPIエンドポイントを追加する際は、以下の手順で実装してください：

### 1. TypeSpec定義の作成
```bash
# 親ディレクトリのTypeSpecディレクトリに移動
cd ../../docs/openapi/

# 新しいエンドポイント用の.tspファイルを作成（例：health.tsp）
# または既存の.tspファイルに追加

# main.tspファイルに新しい.tspファイルをインポート追加
```

### 2. OpenAPI仕様の生成
```bash
# TypeSpecからOpenAPI仕様を生成
cd ../../docs/openapi/
npm run compile
```

### 3. Go型とサーバーコードの生成
```bash
# バックエンドディレクトリに戻る
cd ../../apps/backend/

# OpenAPI型を生成
task gen-type

# サーバーコードを生成
task gen-server
```

### 4. ハンドラーの実装
```bash
# internal/presentation/api/handler/に新しいハンドラーファイルを作成
# 生成された型を使用してハンドラーを実装
```

### 5. サーバーへの統合
```bash
# internal/presentation/api/server/server.goを更新：
# - 新しいハンドラーをServerStruct\に追加
# - NewServer関数のパラメータに追加
# - 生成されたServerInterfaceのメソッドを実装
```

### 6. main.goの更新
```bash
# cmd/main.goで新しいハンドラーをインスタンス化
# NewServerに新しいハンドラーを渡す
```

### 7. 動作確認
```bash
# アプリケーションをビルドして確認
go build ./cmd/main.go

# 実行してエンドポイントをテスト
go run cmd/main.go
```

### 注意点
- TypeSpec定義では適切な@tag、@route、@summaryを設定
- レスポンス型とエラーハンドリングを含む完全な定義を作成
- 生成された型名は`Namespace\Model\Name`の形式になるため、ハンドラーで正確な型名を使用
- 必ずビルドして型エラーがないことを確認

## 共通パターン

- すべてのドメインエンティティはコンストラクタ関数を持つ不変バリューオブジェクト
- データ永続化抽象化のリポジトリパターン
- 明示的なエラー返却によるGoの慣例に従ったエラーハンドリング
- ドメインエンティティ作成時にバリデーション実行
- データベースクエリは `sql/query.sql` からSQLCで生成