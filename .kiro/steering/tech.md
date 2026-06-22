# 技術スタック

## アーキテクチャ

Cloudflare エコシステムを中心に据えた SPA + API 構成。

- **フロントエンド**: Vite + React の SPA を Cloudflare Pages にデプロイ。
- **バックエンド**: Go 製 HTTP API を Cloudflare Containers でホストし、Worker が Container Binding 経由でリクエストをフォワードする（Worker はステートレスなプロキシ層）。
- **DB**: Neon の PostgreSQL。スキーマ適用は Atlas (`task postgres:migrate`)。
- **オブジェクトストレージ**: Cloudflare R2（アバター画像）。aws-sdk-go-v2 の S3 クライアントで操作。
- **認証**: AWS Cognito（Google / LINE フェデレーション）。SPA は PKCE フロー、バックエンドは GetUser でトークン検証。
- **インフラ管理**: AWS は CDK で Cognito と GitHub OIDC ロールのみ管理。Cloudflare は wrangler で管理。
- **可観測性**: OpenTelemetry でトレースを出力（ローカルは Docker Compose の Jaeger）。

## コア技術（実ファイルで確認済みのバージョン）

- **バックエンド言語**: Go 1.25.1
- **フロントエンド言語 / ランタイム**: TypeScript 5.9 / React 19、Node.js 22 系
- **ビルド**: Vite（フロント）/ マルチステージ Docker ビルド（バック）
- **パッケージマネージャ**: フロントは pnpm（`pnpm-lock.yaml`）

## 主要ライブラリ（開発パターンに影響するもののみ）

**バックエンド**
- `labstack/echo/v4` — HTTP ルーティング / ミドルウェア
- `jackc/pgx/v5` — PostgreSQL ドライバ
- **sqlc** — SQL からタイプセーフな Go クエリコードを生成（ORM は使わない）
- **oapi-codegen** — `openapi.yaml` から Go の型と ServerInterface を生成
- `aws-sdk-go-v2` — Cognito GetUser によるトークン検証、R2/S3 操作
- `go.uber.org/mock` (mockgen) — リポジトリ / ユースケースのモック生成
- OpenTelemetry、`oklog/ulid`（主キーは ULID）

**フロントエンド**
- **TanStack Router**（file-based）/ **TanStack Query** / **TanStack Form** + Zod
- **Tailwind CSS v4** + **shadcn/ui**（Radix ベース）
- `oidc-client-ts` — Cognito PKCE クライアント
- `openapi-fetch` — `openapi.yaml` から生成した型でタイプセーフに API 呼び出し
- date-fns、lucide-react、browser-image-compression

## 開発標準

### 型安全性
- OpenAPI スキーマ (`backend/openapi.yaml`) を API 契約の単一の真実とし、両端の型を生成する。
- フロントは TypeScript strict。バックは明示的なエラー返却を徹底。

### Lint / フォーマット
- **フロントは Biome**（lint + format を単一ツールで）。`pnpm lint` / `pnpm format`。
- 生成物（`routeTree.gen.ts`, `schema.d.ts`, `*.gen.go`）は対象外・手編集禁止。
- バックは gofmt / goimports。

### テスト
- バックは `task api:test`（`go test -race ./...`）。モックは `task api:gen-mock` (mockgen) で生成し `*/test/*.gen.go` に置く。
- 現状テストスイートはまだ薄い（モック基盤は整備済みだが手書きテストは少ない）。フロントには専用のテストフレームワークは未導入。

## よく使うコマンド

タスクランナーは **Taskfile**（リポジトリルートの `Taskfile.yaml`）。ローカルインフラは Docker Compose（`compose.yaml`）。git フックは lefthook。

```bash
# ローカルインフラ（Postgres / LocalStack / Jaeger）
docker compose up -d

# バックエンド
task postgres:migrate     # Atlas でスキーマ適用
task postgres:seed        # シードデータ投入
task sqlc:gen             # SQL → Go クエリ生成
task api:gen-interface    # OpenAPI → Go 型 + サーバスタブ
task api:gen-mock         # mockgen でモック生成
task api:test             # go test -race ./...
task api:dev              # API 開発サーバ（ホットリロード）
task api:docs             # OpenAPI ドキュメントプレビュー

# フロントエンド（frontend/ で）
pnpm dev                  # Vite 開発サーバ
pnpm build                # tsc -b && vite build（型チェック込み）
pnpm lint / pnpm format   # Biome
pnpm gen:api              # openapi-typescript で schema.d.ts を再生成
```

## 主要な技術的判断

- **Cloudflare Containers + Worker Binding**: コンテナ隔離されたコンピュートを Cloudflare 上で動かし、Worker は薄いプロキシ層として配置する。
- **OpenAPI ファースト**: 契約を 1 箇所で定義し、Go / TypeScript 双方の型とドキュメントを生成。契約変更時は生成物も同一コミットに含める。
- **sqlc（ORM なし）**: クエリは SQL で書き、結果型を Go に生成。ランタイムオーバーヘッドのない型安全を得る。
- **TanStack エコシステム統一**: Router の loader でデータ取得、Query でサーバ状態をキャッシュ、Form + Zod でバリデーション。
- **Tailwind v4 + shadcn/ui**: セマンティックなデザイントークンと Radix ベースのアクセシブルなコンポーネントで、独自スタイルを最小化。

---
_標準とパターンを記述し、すべての依存関係を列挙はしない_
