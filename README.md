[![OpenAPI](https://img.shields.io/badge/OpenAPI-Swagger%20UI-85EA2D?logo=swagger)](https://dev-openapi.datti.app)

# Datti

誰にいくら払ったかを記録・共有するサービス

## アーキテクチャ

```
┌──────────────────────────┐                     ┌────────────────────────────┐
│ Cloudflare Pages         │                     │ AWS Cognito                │
│  - Vite SPA (frontend)   │ ──── PKCE ────▶     │  - User Pool / Hosted UI   │
└──────────────────────────┘                     │  - Google / LINE IDP       │
              │                                  └────────────────────────────┘
              │ HTTPS (CORS)
              ▼
┌──────────────────────────┐
│ Cloudflare Containers    │
│  - Worker (proxy)        │
│    └─ Go + Echo backend  │ ──── HTTPS ────▶  Neon (PostgreSQL)
└──────────────────────────┘                  Cloudflare R2 (Avatar storage)
                                              AWS Cognito GetUser (JWT 検証)
```

- **フロント** (Vite + React + TanStack Router): Cloudflare Pages にデプロイ
- **バック** (Go + Echo): Cloudflare Containers でホスト (Worker が Container Binding でフォワード)
- **DB**: Neon の PostgreSQL (Cloudflare からも到達可能)
- **オブジェクトストレージ**: Cloudflare R2 (アバター画像、S3 互換 API)
- **認証**: AWS Cognito を SPA から PKCE で叩く。バックは AWS SDK で Cognito GetUser を呼んでトークン検証

## リポジトリ構成

| ディレクトリ | 説明 |
| --- | --- |
| `backend` | Go 製 API サーバー本体 + Cloudflare Containers 用 Worker エントリ (`src/`, `wrangler.toml`) |
| `frontend` | Vite + React + TanStack Router 製 SPA |
| `infra` | AWS CDK (現在は Cognito + GitHub OIDC Role のみ) |
| `infra-cloudflare` | Pulumi Go (R2 / Pages) |

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
| Go | 1.26.x |
| [pnpm](https://pnpm.io) (wrangler 用) | 最新 |
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
| Node.js | 22.x 以上 |
| [pnpm](https://pnpm.io) | 最新 |

## 環境変数

環境変数は [1Password Environments](https://developer.1password.com/docs/environments/) で管理しています。

### 環境一覧

| 環境名 | Destination | 説明 |
| --- | --- | --- |
| Datti Backend | `backend/.env` | バックエンド API 用 |
| Datti Frontend | `frontend/.env` | フロントエンド用 (Vite が読み取る) |

## デプロイ環境変数

### GitHub Actions Secrets

リポジトリの Settings > Secrets and variables > Actions で設定します。

| Secret | 用途 |
| --- | --- |
| `AWS_ROLE_ARN` | CDK デプロイ用 GitHub OIDC ロール |
| `AWS_ACCOUNT_ID` | AWS アカウント ID |
| `GOOGLE_CLIENT_ID` | Cognito Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Cognito Google OAuth |
| `LINE_CHANNEL_ID` | Cognito LINE OIDC |
| `LINE_CHANNEL_SECRET` | Cognito LINE OIDC |
| `POSTGRES_DSN` | Atlas schema apply 用 (Neon) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages / Containers デプロイ用 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Pages / Containers デプロイ用 |
| `VITE_API_URL` | フロントエンドビルド時のバックエンド URL |
| `VITE_COGNITO_DOMAIN` | Cognito Hosted UI ドメイン |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID |
| `VITE_COGNITO_REDIRECT_URI` | OAuth コールバック URL |

### Cloudflare Secrets

`wrangler secret put NAME` で `backend/` ディレクトリから個別に登録します。

| Secret | 用途 |
| --- | --- |
| `POSTGRES_DSN` | PostgreSQL 接続文字列 (Neon) |
| `LINE_CHANNEL_ID` | LINE Login (Cognito 経由ではなくバックから直接叩く方) |
| `LINE_CHANNEL_SECRET` | 同上 |
| `AWS_ACCESS_KEY_ID` | Cognito GetUser を叩くための AWS アクセスキー |
| `AWS_SECRET_ACCESS_KEY` | 同上 |

R2 アクセス用のキーも上の AWS_* と同じ環境変数名で読まれるので、用途を分けたい場合は IAM/R2 のスコープを最小化したキーを別途用意する。

### AWS SSM Parameter Store

CDK が自動作成するパラメータ:

| パラメータ | 用途 |
| --- | --- |
| `/datti/COGNITO_USER_POOL_ID` | Cognito ユーザープール ID |
| `/datti/COGNITO_CLIENT_ID` | Cognito クライアント ID |
| `/datti/COGNITO_DOMAIN` | Cognito Hosted UI ドメイン URL |
| `/datti/COGNITO_ISSUER` | Cognito Issuer URL |

CDK Output (Cognito 値をフロントの環境変数 / Cloudflare Secrets に反映する際に参照):

| 出力名 | 用途 |
| --- | --- |
| `CognitoUserPoolId` | Cognito ユーザープール ID |
| `CognitoClientId` | Cognito App Client ID |
| `CognitoDomain` | Cognito Hosted UI ドメイン URL |
| `GitHubActionsRoleArn` | GitHub Actions の Assume Role 用 ARN |

## セットアップ手順

### 1. コンテナ群の起動
リポジトリ直下の `compose.yaml` を利用します。
```bash
docker compose up -d
```
- Postgres: `localhost:5432`
- LocalStack (R2 のローカル代替として S3 API を提供): `localhost:4566`
- Jaeger UI: `http://localhost:16686`

### 2. Git フックのセットアップ
```bash
lefthook install
```

### 3. 環境変数の同期
1Password Environments で `.env` ファイルを同期。

### 4. バックエンドのセットアップ
```bash
cd backend && go mod download && pnpm install
task postgres:migrate
task postgres:seed
task localstack:init
```
`pnpm install` は wrangler / Worker 依存のためで、ローカル開発 (`air`) では使いません。

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
- `air` + `godotenv` + `dlv` でホットリロード + デバッグ (`:2345`)
- アバターは LocalStack S3 が R2 の API 互換ローカル相当として動く

### フロントエンド
```bash
task web:dev
```
- Vite 開発サーバーが `http://localhost:3000` で起動
- VITE_* env を読みつつホットリロード

### Worker (Cloudflare Containers) のローカル確認
通常開発では使いません。Worker レイヤーや Container Binding の挙動を確認したいときだけ:
```bash
cd backend
pnpm dev   # wrangler dev (内部で docker build + container 起動)
```

## デプロイ

### フロントエンド (Cloudflare Pages)
- `main` に push → `.github/workflows/merge-to-main.yaml` の `deploy-frontend`
- `pnpm build` で VITE_* を注入してビルド
- `wrangler pages deploy` で Cloudflare Pages にアップロード

### バックエンド (Cloudflare Containers)
- `main` に push → `.github/workflows/merge-to-main.yaml` の `deploy-backend`
- `wrangler deploy` で Container イメージのビルド + Cloudflare へのプッシュ + Worker デプロイをまとめて実行

### スキーマ (Neon PostgreSQL)
- `backend/sql/**` 変更 → Atlas で apply

### インフラ (Cognito)
- `infra/**` 変更 → CDK で apply (現在は Cognito + OIDC Role だけ)

### インフラ (Cloudflare R2 / Pages)
- `infra-cloudflare/**` 変更 → Pulumi で apply
- state backend は R2 を使う (self-managed)

#### 初回セットアップ
```bash
# 1. state 用バケットを Cloudflare ダッシュボードで1個だけ手動作成
#    例: datti-pulumi-state

# 2. R2 API トークンを発行 (Object Read & Write)
#    Access Key ID / Secret Access Key を控える

# 3. Pulumi に state backend を登録
#    AWS_REGION=auto は R2 が "ap-northeast-1" などのリージョン名を受け付けないため必須
export AWS_REGION=auto
export AWS_ACCESS_KEY_ID=<R2 Access Key>
export AWS_SECRET_ACCESS_KEY=<R2 Secret>
pulumi login 's3://datti-pulumi-state?endpoint=https://<ACCOUNT_ID>.r2.cloudflarestorage.com&s3ForcePathStyle=true'

# 4. state 暗号化用パスフレーズを設定 (今後 apply するたびに必須)
export PULUMI_CONFIG_PASSPHRASE=<好きな文字列>

# 5. Cloudflare API トークン (Cloudflare provider が使う)
export CLOUDFLARE_API_TOKEN=<アカウント API トークン>

# 6. stack 初期化と config セット
#    self-managed backend は stack 名を organization/project/stack の 3 階層で指定する必要あり
#    organization の部分は任意 (慣例で "organization" や handle を使う)
cd infra-cloudflare
pulumi stack init organization/datti/prod
pulumi config set accountId <CLOUDFLARE_ACCOUNT_ID>
pulumi config set zoneId <CLOUDFLARE_ZONE_ID>

# 7. apply
pulumi up
```

#### 通常運用
```bash
cd infra-cloudflare
export AWS_REGION=auto
export AWS_ACCESS_KEY_ID=<R2 Access Key>
export AWS_SECRET_ACCESS_KEY=<R2 Secret>
export PULUMI_CONFIG_PASSPHRASE=<パスフレーズ>
export CLOUDFLARE_API_TOKEN=<トークン>
pulumi preview   # 差分確認
pulumi up        # apply
```

## 利用可能な Task 一覧

| タスク | 内容 |
| --- | --- |
| `task postgres:migrate` | Atlas 経由で Postgres スキーマを適用 |
| `task postgres:seed` | サンプルデータを投入 |
| `task localstack:init` | LocalStack の S3 バケット (R2 ローカル相当) を初期化 |
| `task sqlc:gen` | `sql/query.sql` から `internal/gateway/postgres` のクエリコードを生成 |
| `task api:gen-interface` | OpenAPI から型とサーバースタブを生成 |
| `task api:gen-mock` | モックを生成 |
| `task api:test` | テストの実行 |
| `task api:dev` | バックエンド開発サーバー (air) を起動 |
| `task api:docs` | OpenAPI ドキュメントをプレビュー |
| `task web:dev` | フロントエンド開発サーバー (vite) を起動 |

OpenAPI 定義は `backend/openapi.yaml`。
