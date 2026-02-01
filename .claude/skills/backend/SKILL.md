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

OpenTelemetryで各層にトレースを実装。OTLP HTTPで送信（ローカル: Jaeger `http://localhost:4318`）。

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
- `task api:gen-interface` で型とサーバースタブを生成

### 4. ハンドラー実装

- `backend/internal/presentation/api/handler/` にハンドラーを実装
- ユースケースを依存として受け取る
- 認証情報取得（`middleware.AuthMiddleware` からの `uid`）
- レスポンス整形（ドメインモデル → 生成されたレスポンス型）
- `backend/internal/presentation/api/server/server.go` にハンドラーインターフェースを追加、`backend/cmd/main.go` でDI

### 5. リポジトリ実装（ゲートウェイとDBマイグレーション）

- `backend/sql/schema.sql` にテーブル定義
- `backend/sql/query.sql` にクエリ定義
- `task sqlc:gen` でコード生成
- `backend/internal/gateway/repository/` にリポジトリ実装
- `task postgres:migrate` でスキーマ適用
- `backend/cmd/main.go` でDI設定を更新

### 6. ビルド確認

`go vet ./...` でビルドエラーと静的解析を実行。

## 避けるべきこと

- **過度な設計**: 要求された機能以外の追加や改善を避ける
- **後方互換性ハック**: 未使用の変数名変更、型の再エクスポート、削除コードのコメントなど。不要なものは完全に削除する
- **早すぎる抽象化**: 1回限りの操作のためのヘルパーやユーティリティを作らない
- **不要なエラーハンドリング**: 発生しないシナリオの検証を追加しない。システム境界（ユーザー入力、外部API）でのみ検証する

## 開発コマンド

すべてのタスクはリポジトリルートから実行します。

```bash
# データベース
task postgres:migrate    # Atlas経由でスキーマ適用
task postgres:seed       # サンプルデータ投入

# コード生成
task sqlc:gen            # SQLCでクエリコード生成
task api:gen-interface   # OpenAPIから型とサーバースタブ生成
task api:gen-mock        # モック生成

# テスト（ユーザーから明示的な指示があった場合のみ）
task api:test            # go test -race ./...
```

## ローカルデバッグ

### 前提条件

| ツール | 用途 | インストール |
|--------|------|--------------|
| Docker | PostgreSQL, DynamoDB Local, Jaeger | `brew install --cask docker` |

### 環境構築手順

```bash
# 1. コンテナ起動（リポジトリルートで実行）
docker compose up -d

# 2. DBマイグレーション
task postgres:migrate
task dynamo:migrate

# 3. 開発サーバー起動
task api:dev
```

### 起動後のポート

| サービス | ポート | 用途 |
|----------|--------|------|
| Echo API | :7070 | APIサーバー |
| Delve | :2345 | デバッガー接続 |
| PostgreSQL | :5432 | データベース |
| DynamoDB Local | :8000 | セッション管理（フロントエンド用） |
| Jaeger UI | :16686 | 分散トレース |

### デバッグ手法

**1. ログベースデバッグ**

コードに `log.Printf` を追加 → air が自動リビルド → ターミナルでログ確認

```go
log.Printf("Debug: userID=%s, amount=%d", userID, amount)
```

**2. APIテスト**

```bash
# ヘルスチェック
curl http://localhost:7070/health

# 認証が必要なエンドポイント（401が返る）
curl http://localhost:7070/v1/users/me

# レスポンスとステータスコード確認
curl -s -w "\nHTTP Status: %{http_code}" http://localhost:7070/v1/groups
```

**3. 静的解析**

```bash
go vet ./...
```

**4. トレース確認**

ブラウザで `http://localhost:16686` を開き、Jaeger UIでリクエストのトレースを確認。

### トラブルシューティング

| エラー | 原因 | 対処 |
|--------|------|------|
| `missing scheme` | `.env` が存在しない | 1Password Environmentsで同期 |
| `bind: address already in use` | ポート競合 | `lsof -ti:2345 \| xargs kill -9` |

## 重要な実務ルール

### コード生成の管理

- **API定義後**: `backend/openapi.yaml` 変更 → `task api:gen-interface`
- **SQL定義後**: `backend/sql/schema.sql` や `backend/sql/query.sql` 変更 → `task sqlc:gen` 実行
- **リポジトリインターフェース追加後**: `Taskfile.yaml` に mockgen 設定追加 → `task api:gen-mock` 実行
- **生成物は元データと同じコミットに含める**

### コーディング規約

- **Go 1.24**: `gofmt` / `goimports` を必ず適用（タブインデント）
- **生成ファイル** (`*.gen.go`): 手動編集は禁止。生成元を更新しコマンドを再実行する
- **エラーハンドリング**: 明示的なエラー返却

### 実装パターン

#### ドメイン層

**エンティティ**
- ファクトリ関数 (`NewXxx`, `CreateXxx`) には `context.Context` を第一引数に取る
- バリデーションエラーは `ValidationError` を使い、フィールド名 + メッセージで構造化
- エラーメッセージは日本語で統一

**リポジトリ**
- 集約単位で分割 (テーブル単位ではない)
- インターフェースの引数には名前を付ける (`ctx context.Context, id ulid.ULID`)
- 関連エンティティは `User` を直接使う (中間エンティティは作らない)

**トレーシング**
- span名は `domain.エンティティ名.操作` 形式 (例: `domain.Group.Create`)
- deferパターンでエラー記録を統一

#### ユースケース層

**構造**
- `XxxUseCaseImpl` 構造体 + `NewXxxUseCase` ファクトリ関数
- 依存はリポジトリインターフェースで注入

**トレーシング**
- span名は `usecase.エンティティ名.操作` 形式 (例: `usecase.Group.Create`)
- deferパターンでエラー記録を統一:
  ```go
  func (u Impl) Method(ctx context.Context, input Input) (output *Output, err error) {
      ctx, span := tracer.Start(ctx, "usecase.Xxx.Method")
      defer func() {
          if err != nil {
              span.SetStatus(codes.Error, err.Error())
              span.RecordError(err)
          }
          span.End()
      }()
      // ...
  }
  ```

#### GoDoc

- 構造体・メソッドにコメントを付ける
- ファクトリ関数は「〜のファクトリ関数」と記載
- 補足情報は半角括弧で記載 (例: `(作成者のみ実行可能)`)
- パッケージには `doc.go` を作成し説明を記載

### 認証・環境

- **認証**: AWS Cognito（`middleware.AuthMiddleware` が `uid` を注入）
- **通貨**: すべて円（整数）
- **環境変数**: `backend/.env` 参照

## 参考資料

### Context7 で最新ドキュメントを参照

ライブラリのAPIを確認する際は `use context7` を使用すること。LLMの学習データより新しい情報を取得できる。

対象ライブラリ:
- **sqlc** - クエリ構文、設定オプション
- **oapi-codegen** - OpenAPI生成設定
- **OpenTelemetry** - Go SDK トレースAPI

