# Technology Stack

## Architecture

フロント / バックを分離した構成。SPA が Cloudflare Pages、API が Cloudflare Containers 上の Go サーバーで動き、Worker が Container Binding 経由でリクエストをフォワードする。

```
Cloudflare Pages (SPA) ──PKCE──▶ AWS Cognito (Google / LINE IDP)
        │ HTTPS (CORS)
        ▼
Cloudflare Worker ──Container Binding──▶ Go + Echo backend
                                              ├─▶ Neon (PostgreSQL)
                                              ├─▶ Cloudflare R2 (アバター, S3 互換)
                                              └─▶ Cognito GetUser (トークン検証)
```

バックエンドはクリーンアーキテクチャの 4 層構造。依存方向は **プレゼンテーション → ユースケース → ドメイン ← ゲートウェイ**。詳細は [structure.md](structure.md) と [backend/CLAUDE.md](../../backend/CLAUDE.md)。

## Core Technologies

- **Backend**: Go 1.26 + Echo / OpenTelemetry (OTLP HTTP トレース)
- **Frontend**: TypeScript 5 + React 19 + Vite
- **DB**: Neon PostgreSQL（スキーマ管理は Atlas、クエリは sqlc 生成）
- **Auth**: AWS Cognito（SPA は PKCE、バックは GetUser でトークン検証）
- **Storage**: Cloudflare R2（aws-sdk-go-v2 の S3 クライアント / ローカルは LocalStack）
- **Infra**: AWS は CDK (Cognito + GitHub OIDC のみ)、Cloudflare は Pulomi (R2/Pages) + wrangler

## Key Libraries

- **Frontend**: TanStack Router (file-based) / TanStack Query / TanStack Form + Zod / React Aria Components / Tailwind v4 / openapi-fetch / oidc-client-ts
- **Backend**: oapi-codegen (OpenAPI→型/スタブ) / sqlc (SQL→Go) / mockgen / aws-sdk-go-v2

## Development Standards

### Type Safety
- Frontend: TypeScript strict、`pnpm typecheck` (`tsc --noEmit`) を通す
- Backend: 生成ファイル (`*.gen.go`, `schema.d.ts`) は手動編集禁止 — 生成元を更新して再生成

### Code Quality
- Frontend: Biome (lint / format)
- Backend: `gofmt` / `goimports` 必須（タブインデント）、`go vet ./...` でビルド確認

### Testing
- Backend: `task api:test` (`go test -race ./...`)。**ユーザーから明示的な指示があった場合のみ実行**

### Contract-First & Codegen
- API 契約は `backend/openapi.yaml` が単一の真実。変更後は `task api:gen-interface` (バック) と `pnpm gen:api` (フロント) の両方を再生成
- DB は `sql/schema.sql` / `sql/query.sql` → `task sqlc:gen`
- **生成物は元データと同じコミットに含める**

## Development Environment

### Required Tools
- 共通: Docker / Docker Compose, gitleaks, lefthook
- Backend: Go 1.26, Task, sqlc, Atlas, oapi-codegen, mockgen, air, dlv, pnpm (wrangler 用)
- Frontend: Node.js 22+, pnpm

### Common Commands
```bash
# Backend dev:  task api:dev          # air + godotenv + dlv (:2345)
# Frontend dev: task web:dev          # vite (:3000)
# DB migrate:   task postgres:migrate # Atlas
# Codegen:      task sqlc:gen / task api:gen-interface / pnpm gen:api
# Test:         task api:test         # 明示指示時のみ
```

## Key Technical Decisions

- **通貨は円 (整数) で統一** — 浮動小数を使わない
- **日付は JST (Asia/Tokyo) で統一** — 送信は ISO `+09:00`、表示は `@/utils/format` の `formatDate`
- **認証検証は現状 Cognito GetUser を毎回呼ぶ** — 将来 JWKS ローカル検証へ切替予定
- **データ取得は loader + `ensureQueryData`** — `useEffect`/`useState` でのフェッチ禁止
- **環境変数は 1Password Environments で管理** — ローカル `.env`、本番は Cloudflare Secrets / wrangler `[vars]`

## Library Docs
ライブラリ API を確認する際は context7 (`use context7`) を使う。

---
_Document standards and patterns, not every dependency_
