[![OpenAPI](https://img.shields.io/badge/OpenAPI-Swagger%20UI-85EA2D?logo=swagger)](https://dev-openapi.datti.app)

# Datti

誰にいくら払ったかを記録・共有するサービス

## リポジトリ構成

| ディレクトリ | 説明 |
| --- | --- |
| `backend` | Go 製 API サーバー本体（Taskfile、スキーマ、OpenAPI 生成物を含む） |
| `frontend` | Vite + React + TanStack Router 製 SPA フロントエンド |
| `infra` | AWS CDK によるインフラ構成管理 |

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
| Datti Frontend | `frontend/.env` | フロントエンド用 (Vite が読み取る) |

## デプロイ環境変数

### GitHub Actions Secrets

リポジトリの Settings > Secrets and variables > Actions で設定します。

| Secret | 用途 | 設定元 |
| --- | --- | --- |
| `AWS_ROLE_ARN` | GitHub OIDC で Assume するロール | AWS IAM（CDKで作成） |
| `AWS_ACCOUNT_ID` | AWS アカウント ID | AWS |
| `GOOGLE_CLIENT_ID` | Cognito Google OAuth | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Cognito Google OAuth | Google Cloud Console |
| `POSTGRES_DSN` | PostgreSQL 接続文字列 | Neon |
| `CLOUDFLARE_API_TOKEN` | Swagger UI を Cloudflare Pages にデプロイする用 | Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Swagger UI を Cloudflare Pages にデプロイする用 | Cloudflare |
| `VITE_API_URL` | フロントエンドビルド時に注入するバックエンド URL | (env ごとに設定) |
| `VITE_COGNITO_DOMAIN` | Cognito Hosted UI ドメイン | CDK Output |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID | CDK Output |
| `VITE_COGNITO_REDIRECT_URI` | OAuth コールバック URL | (env ごとに設定) |
| `WEB_DISTRIBUTION_ID` | フロントエンド (S3 + CloudFront) の Distribution ID | CDK Output (`WebDistributionId`) |

### ecspresso 環境変数 (backend のみ)

GitHub Actions から ecspresso に渡す環境変数です。フロントエンドは Cloudflare Pages に直接デプロイするため不要。

| 変数 | 用途 | dev | prod |
| --- | --- | --- | --- |
| `ENV` | 環境識別子 | `dev` | `prod` |
| `AWS_ACCOUNT_ID` | AWS アカウント ID | Secrets から | Secrets から |
| `IMAGE_TAG` | Docker イメージタグ | `dev` | `prod` |

### AWS SSM Parameter Store

#### CDK が自動作成するもの

| パラメータ | 用途 |
| --- | --- |
| `/datti/{env}/COGNITO_USER_POOL_ID` | Cognito ユーザープール ID |
| `/datti/{env}/COGNITO_CLIENT_ID` | Cognito クライアント ID |
| `/datti/{env}/COGNITO_DOMAIN` | Cognito ドメイン URL |
| `/datti/{env}/COGNITO_ISSUER` | Cognito Issuer URL |
| `/datti/{env}/S3_AVATAR_BUCKET` | アバター用 S3 バケット名 |
| `/datti/{env}/AVATAR_BASE_URL` | CloudFront CDN URL (アバター) |

CDK Output (CFn Output) で取れるもの:

| 出力名 | 用途 |
| --- | --- |
| `WebBucketName` | フロントエンド配置先 S3 バケット名 |
| `WebDistributionId` | フロントエンド配信用 CloudFront Distribution ID (Invalidation で使用) |
| `WebDistributionDomain` | CloudFront のデフォルトドメイン (カスタムドメインを当てるまでの確認用) |

#### 手動設定が必要なもの

CDK は `CHANGE_ME` で作成するため、デプロイ後に手動で値を設定してください。

| パラメータ | 用途 | 設定元 |
| --- | --- | --- |
| `/datti/{env}/backend/POSTGRES_DSN` | PostgreSQL 接続文字列 | Neon |
| `/datti/{env}/cloudflared/token` | Cloudflare トンネルトークン | Cloudflare |

### 新環境追加時のチェックリスト

1. GitHub Secrets に `AWS_ROLE_ARN`, `AWS_ACCOUNT_ID` 等を設定
2. CDK デプロイで SSM パラメータが自動作成される
3. SSM 手動設定: `/datti/{env}/backend/POSTGRES_DSN`, `/datti/{env}/cloudflared/token`
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
task localstack:init
```
※ Task コマンドはリポジトリルートから実行します。

### 5. フロントエンドのセットアップ
```bash
cd frontend
pnpm install
cp .env.example .env  # 必要な値を埋める
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
- Vite 開発サーバーが `http://localhost:3000` で起動します
- ソース変更を監視しホットリロードが行われます

#### 必要な環境変数 (`frontend/.env`)
| 変数 | 用途 |
| --- | --- |
| `VITE_API_URL` | バックエンド API URL (例: `http://localhost:7070`) |
| `VITE_COGNITO_DOMAIN` | Cognito Hosted UI ドメイン |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID |
| `VITE_COGNITO_REDIRECT_URI` | OAuth コールバック (例: `http://localhost:3000/api/auth/cognito/callback`) |

## 利用可能な Task 一覧

すべてのタスクはリポジトリルートから実行します。

| タスク | 内容 |
| --- | --- |
| `task postgres:migrate` | Atlas 経由で Postgres スキーマを適用 |
| `task postgres:seed` | サンプルデータを投入 |
| `task localstack:init` | LocalStack の S3 バケットを初期化 (アバター用) |
| `task sqlc:gen` | `sql/query.sql` から `internal/gateway/postgres` のクエリコードを生成 |
| `task api:gen-interface` | OpenAPI から型とサーバースタブを生成（出力: `internal/presentation/api/*.gen.go`） |
| `task api:gen-mock` | モックを生成（出力: `internal/usecase/test` など） |
| `task api:test` | テストの実行 |
| `task api:dev` | バックエンド開発サーバーを起動（air 経由） |
| `task api:docs` | OpenAPI ドキュメントをプレビュー |
| `task web:dev` | フロントエンド開発サーバーを起動 |

OpenAPI の元定義は `backend/openapi.yaml` に配置されています。
