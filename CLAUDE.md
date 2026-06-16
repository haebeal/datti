# CLAUDE.md

このファイルはClaude Codeがこのリポジトリで作業する際のガイダンスを提供します。READMEは人間向けの全体説明、本書はエージェントが即戦力として動くためのルールと手順をまとめたものです。

## 概要

Dattiは割り勘・立て替え管理アプリです。誰にいくら払ったかを記録・共有し、グループ内の精算を簡単にします。

- **バックエンド**: Go 製 API サーバー (Cloudflare Containers でホスト、Worker が Container Binding でフォワード)
- **フロントエンド**: Vite + React + TanStack Router (Cloudflare Pages)
- **DB**: Neon の PostgreSQL
- **オブジェクトストレージ**: Cloudflare R2 (アバター画像、aws-sdk-go-v2 S3 クライアントで操作)
- **認証**: AWS Cognito (Google / LINE フェデレーション、SPA で PKCE フロー、バックから GetUser でトークン検証)
- **インフラ管理**: AWS は CDK で Cognito と GitHub OIDC ロールのみ管理。Cloudflare は wrangler で管理。

セットアップ手順は [README.md](README.md) を参照。

## バックエンド開発

バックエンドタスクを実行する際は、以下が自動的に適用されます：

- **プラグイン**: `go-backend-plugin` — 汎用的なGoバックエンド開発ガイド
- **コンテキスト**: [backend/CLAUDE.md](backend/CLAUDE.md) — Datti固有のアーキテクチャ、実装フロー、コマンド

## フロントエンド開発

- **スタック**: Vite + React 19 + TypeScript + TanStack Router (file-based) + TanStack Query + TanStack Form + React Aria Components + Tailwind v4 + Biome
- **データ取得**: TanStack Router の loader で `queryClient.ensureQueryData(queryOptions(...))`、コンポーネントは `useSuspenseQuery`
- **認証ガード**: `_authenticated.tsx` の `beforeLoad` で `userManager.getUser()` を見て未認証なら `/auth` へ
- **コンテキスト**: [frontend/CLAUDE.md](frontend/CLAUDE.md) — Datti固有のディレクトリ構成、フォームパターン、デザインシステム

## プロジェクト管理（Linear）

タスク管理にはLinearを使用しています。MCP経由でチケットの確認・更新が可能です。

- **プラグイン**: `linear-product-owner-plugin` — 汎用的なLinearチケット管理ガイド
- **チケット形式**: `DATTI-xxx`
- **チケット確認**: `mcp__linear-server__get_issue` でチケット内容を取得
- **チケット一覧**: `mcp__linear-server__list_issues` でチーム内のチケットを取得
- **GitHub連携**: PRタイトルに `DATTI-xxx` を含めると自動でリンク。マージ時にチケットがDoneに移行。

### Datti固有のLinear設定

| 項目 | 値 |
|------|-----|
| チーム名 | Datti |
| ラベル | Bug / Feature / Improvement |
| 優先度 | Urgent(1), High(2), Medium(3), Low(4) |
| プロジェクト | Datti |

## 作業開始前の確認

- **ブランチ確認**: 作業対象ブランチ（例: `feature/...`）を事前に共有し、ユーザーの合意を取ってから着手する。
- **プラン共有と承認**: これから実施するタスクを細分化して説明し、OK をもらってから実行する。途中でステップを追加する場合も再度確認する。
- **進捗の扱い**: 標準フローのどこにいるかをこまめに共有し、次へ進む前に合意を得る。
- **未確定事項の管理**: 仕様が曖昧な点は TODO やメモとして残す。

## 開発フロー

1. **ブランチ作成**: `feature/` または `fix/` プレフィックスを使用

2. **実装とコミット**
   - タスクを細分化し、1つのタスクが完了したら即座にコミット
   - コミットメッセージは日本語・命令形で記述（例: `型定義を追加`, `Server Actionを実装`）
   - 生成物と元ファイルは同一コミットに含める（例: OpenAPI YAML + 生成された型定義）
   - ビルドエラーがあってもタスク単位で細かくコミットする（リバート容易性を優先）
   - 関連する複数ファイルの変更は1つのコミットにまとめる

## PRの作成

### PR作成の手順（チェックリスト）

- [ ] **Linearチケットの確認**: MCP経由でチケット内容を確認（推測や省略は不可）
- [ ] **PRタイトル**: `[DATTI-xxx] 簡潔な変更内容の説明` 形式（LinearとGitHubが自動連携）
- [ ] **背景・実施内容**: 明確に記載されている
- [ ] **ローカル確認**: 動作確認済み、コンパイルエラーなし

**チケットがない場合**: ドキュメント整理やリファクタリングなど、チケットに紐づかない作業の場合はタイトルにチケット番号を含めなくてよい。

### PR本文のフォーマット

- **背景**: なぜこの変更が必要だったのか
- **原因** (バグの場合): 何が原因でバグが発生していたのか
- **実施内容**: 具体的に何を実装・修正したのか
- **備考** (あれば): レビュワーに伝えておきたい補足情報

## 参考資料

- [README](README.md) - セットアップ手順、コマンド一覧
- [OpenAPI仕様](backend/openapi.yaml) - API契約定義
- [公開ドキュメント](https://dev-openapi.datti.app) - API仕様書
