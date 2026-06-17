# Project Structure

## Organization Philosophy

モノレポをトップで役割ごとに分割（`backend` / `frontend` / `infra` / `infra-cloudflare`）。バックエンドは**レイヤード（クリーンアーキテクチャ）**、フロントエンドは**フィーチャーファースト**で整理する。

## Top-Level Layout

| ディレクトリ | 役割 |
|------|------|
| `backend/` | Go API 本体 (`internal/`, `cmd/`, `sql/`) + Cloudflare Worker エントリ (`src/`, `wrangler.toml`) |
| `frontend/` | Vite + React SPA (`src/`) |
| `infra/` | AWS CDK（Cognito + GitHub OIDC ロールのみ） |
| `infra-cloudflare/` | Pulumi (R2 / Pages)、state backend は R2 (self-managed) |

## Backend Patterns (`backend/internal/`)

クリーンアーキテクチャ 4 層。新機能はドメインを起点に**内から外へ**実装する。

| 層 | 場所 | 責務 |
|---|---|---|
| Domain | `internal/domain/` | エンティティ、値オブジェクト、リポジトリインターフェース |
| UseCase | `internal/usecase/` | ビジネスロジック、トランザクション管理 |
| Gateway | `internal/gateway/` | リポジトリ実装 (`repository/`)、外部連携 (`storage/`, `line/`)、sqlc 生成 (`postgres/`) |
| Presentation | `internal/presentation/api/` | `handler/`・`middleware/`・`server/`（DI は `cmd/main.go`） |

- **依存方向**: Presentation → UseCase → Domain ← Gateway（内側は外側を知らない）
- **リポジトリは集約単位で分割**（テーブル単位ではない）。関連エンティティは `User` を直接使う
- **トレーシング**: 各層で span 名を `層.エンティティ.操作` 形式（例 `usecase.Group.Create`）、defer でエラー記録を統一
- **ファクトリ関数** (`NewXxx`) は `context.Context` を第一引数に取り、バリデーションはコンストラクタで実行

## Frontend Patterns (`frontend/src/`)

| パターン | 場所 | 内容 |
|---|---|---|
| Routes | `routes/` | TanStack Router file-based。`_authenticated.tsx` がガード + Layout |
| Features | `features/<name>/` | `types` / `schema` / `queries` / `mutations` / `components` を機能ごとに同梱 |
| 共通 UI | `components/ui/` | Button, Input, Select 等のデザインシステム準拠プリミティブ |
| 横断ロジック | `libs/` | `api/`（openapi-fetch + 生成スキーマ）、`auth/`（Cognito userManager） |
| その他 | `hooks/`, `utils/`, `styles/` | 共通フック、`cn`/`format`、`globals.css` |

- **データ取得**: ルートの `loader` で `ensureQueryData`、コンポーネントは `useSuspenseQuery`
- **認証ガード**: `_authenticated.tsx` の `beforeLoad` で `userManager.getUser()` を確認
- **シングルトン状態**: 認証ユーザー等は Context を増やさず、シングルトン + `queryOptions` で扱う

## Naming Conventions

- **Backend**: Go 標準（パッケージ小文字、エクスポートは PascalCase）。生成物は `*.gen.go`、パッケージ説明は `doc.go`
- **Frontend routes**: file-based 規約に従う。`_authenticated.tsx` は pathless layout、`$groupId` は動的セグメント
- **Frontend files**: kebab-case（例 `mobile-menu.tsx`）
- **エラーメッセージ / GoDoc コメント**は日本語で統一

## Styling Conventions (Frontend)

- **セマンティックカラーを使う**: `text-red-500` ではなく `globals.css` 定義の `text-error-base` 等
- スペーシングはデザインシステム規約に従う（フォームパディング `p-6`、要素間 `gap-3`、セクション間 `gap-5`）
- ページの max-width は `_authenticated.tsx` が `max-w-[800px] mx-auto` で当てるのでページ側不要

## Code Organization Principles

- **契約とコードの同期**: `openapi.yaml` / SQL を変更したら生成コマンドを再実行し、同一コミットに含める
- **生成ファイルは手動編集しない**: 生成元を直して再生成する
- 詳細な実装フロー・フォームパターン・デザインシステムは [backend/CLAUDE.md](../../backend/CLAUDE.md) / [frontend/CLAUDE.md](../../frontend/CLAUDE.md) を参照

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
