[![OpenAPI](https://img.shields.io/badge/OpenAPI-Swagger%20UI-85EA2D?logo=swagger)](https://dev-openapi.datti.app)

# Datti

誰にいくら払ったかを記録・共有するサービス

## リポジトリ構成

| ディレクトリ | 説明 |
| --- | --- |
| `backend` | Go 製 API サーバー本体（Taskfile、スキーマ、OpenAPI 生成物を含む） |
| `frontend` | Next.js 製 Web フロントエンド |
| `infra` | Terraform などインフラ構成管理 |

## 必要なツール

### 共通
| ツール | バージョン |
| --- | --- |
| Docker / Docker Compose | 24.x / v2 系 |
| [gitleaks](https://github.com/gitleaks/gitleaks) | 最新 |
| [lefthook](https://github.com/evilmartians/lefthook) | 最新 |

### バックエンド
| ツール | バージョン |
| --- | --- |
| Go | 1.24.x |
| [Task](https://taskfile.dev) | 最新 |
| [godotenv](https://github.com/joho/godotenv) | 最新 |
| [sqlc](https://docs.sqlc.dev) | 最新 |
| [air](https://github.com/air-verse/air) | 最新 |
| psql | 15 以上 |
| [Atlas](https://atlasgo.io/docs) | 最新 |
| [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen) | 最新 |
| [mockgen](https://github.com/uber-go/mock) | 最新 |
| [dlv](https://github.com/go-delve/delve) | 最新 |

### フロントエンド
| ツール | バージョン |
| --- | --- |
| Node.js | 20.x 以上 |
| [pnpm](https://pnpm.io) | 最新 |

## 環境変数

環境変数は [1Password Environments](https://developer.1password.com/docs/environments/) で管理しています。

### セットアップ

1. 1Password デスクトップアプリをインストール
2. 設定から「Developer」機能を有効化
3. 「Developer > View Environments」から共有された環境にアクセス
4. 各環境の Destination で `.env` ファイルのパスを設定

設定後、`.env` ファイルが自動的に同期されます。

### 環境一覧

| 環境名 | Destination | 説明 |
| --- | --- | --- |
| Datti Backend | `backend/.env` | バックエンド API 用 |
| Datti Frontend | `frontend/.env.local` | フロントエンド用 |

## デプロイ環境変数

### GitHub Actions Secrets

リポジトリの Settings > Secrets and variables > Actions で設定します。

| Secret | 用途 | 設定元 |
| --- | --- | --- |
| `AWS_ROLE_ARN` | GitHub OIDC で Assume するロール | AWS IAM（CDKで作成） |
| `AWS_ACCOUNT_ID` | AWS アカウント ID | AWS |
| `GOOGLE_CLIENT_ID` | Cognito Google OAuth | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Cognito Google OAuth | Google Cloud Console |
| `DSN` | PostgreSQL 接続文字列 | Neon |
| `CLOUDFLARE_API_TOKEN` | Swagger UI デプロイ | Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Swagger UI デプロイ | Cloudflare |

### ecspresso 環境変数

GitHub Actions から ecspresso に渡す環境変数です。

| 変数 | 用途 | dev | prod |
| --- | --- | --- | --- |
| `ENV` | 環境識別子 | `dev` | `prod` |
| `AWS_ACCOUNT_ID` | AWS アカウント ID | Secrets から | Secrets から |
| `IMAGE_TAG` | Docker イメージタグ | `dev` | `prod` |
| `APP_URL` | アプリ URL（frontend のみ） | `https://dev.datti.app` | `https://datti.app` |

### AWS SSM Parameter Store

#### CDK が自動作成するもの

| パラメータ | 用途 |
| --- | --- |
| `/datti/{env}/COGNITO_USER_POOL_ID` | Cognito ユーザープール ID |
| `/datti/{env}/COGNITO_CLIENT_ID` | Cognito クライアント ID |
| `/datti/{env}/COGNITO_DOMAIN` | Cognito ドメイン URL |
| `/datti/{env}/COGNITO_ISSUER` | Cognito Issuer URL |
| `/datti/{env}/S3_AVATAR_BUCKET` | アバター用 S3 バケット名 |
| `/datti/{env}/AVATAR_BASE_URL` | CloudFront CDN URL |

#### 手動設定が必要なもの

CDK は `CHANGE_ME` で作成するため、デプロイ後に手動で値を設定してください。

| パラメータ | 用途 | 設定元 |
| --- | --- | --- |
| `/datti/{env}/backend/DSN` | PostgreSQL 接続文字列 | Neon |
| `/datti/{env}/cloudflared/token` | Cloudflare トンネルトークン | Cloudflare |

### 新環境追加時のチェックリスト

1. GitHub Secrets に `AWS_ROLE_ARN`, `AWS_ACCOUNT_ID` 等を設定
2. CDK デプロイで SSM パラメータが自動作成される
3. SSM 手動設定: `/datti/{env}/backend/DSN`, `/datti/{env}/cloudflared/token`
4. GitHub Actions ワークフローに環境を追加

## セットアップ手順

### 1. コンテナ群の起動
リポジトリ直下の `compose.yaml` を利用します。
```bash
docker compose up -d
```
- Postgres: `localhost:5432`
- Jaeger UI: `http://localhost:16686`

### 2. Git フックのセットアップ
シークレット検知用の pre-commit フックをインストールします。
```bash
lefthook install
```

### 3. 環境変数の同期
1Password Environments で `.env` ファイルを同期してください（[環境変数](#環境変数) 参照）。

### 4. バックエンドのセットアップ
```bash
cd backend && go mod download
task postgres:migrate
task postgres:seed
```
※ Task コマンドはリポジトリルートから実行します。

### 5. フロントエンドのセットアップ
```bash
cd frontend
pnpm install
```

## ローカル開発

### バックエンド
```bash
task api:dev
```
- `.air.toml` が `godotenv` と `dlv` を介してバイナリを起動します（デバッグポート :2345）
- ソース変更を監視し自動ビルド・再起動が行われます

### フロントエンド
```bash
task web:dev
```
- `http://localhost:3000` で開発サーバーが起動します
- ソース変更を監視しホットリロードが行われます

## 利用可能な Task 一覧

すべてのタスクはリポジトリルートから実行します。

| タスク | 内容 |
| --- | --- |
| `task postgres:migrate` | Atlas 経由で Postgres スキーマを適用 |
| `task postgres:seed` | サンプルデータを投入 |
| `task dynamo:migrate` | DynamoDB のセッションテーブルを作成 |
| `task sqlc:gen` | `sql/query.sql` から `internal/gateway/postgres` のクエリコードを生成 |
| `task api:gen-interface` | OpenAPI から型とサーバースタブを生成（出力: `internal/presentation/api/*.gen.go`） |
| `task api:gen-mock` | モックを生成（出力: `internal/usecase/test` など） |
| `task api:test` | テストの実行 |
| `task api:dev` | バックエンド開発サーバーを起動（air 経由） |
| `task api:docs` | OpenAPI ドキュメントをプレビュー |
| `task web:dev` | フロントエンド開発サーバーを起動 |

OpenAPI の元定義は `backend/openapi.yaml` に配置されています。
