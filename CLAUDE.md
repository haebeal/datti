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

## 開発フローの全体像（計画層と実行層）

本リポジトリの開発は **2 層** で構成される。Kiro SDD と従来の git/Linear フローは競合するものではなく、上下に重なる関係にある。

```
[計画層] Kiro SDD (.kiro/)
  /kiro-discovery → spec (requirements → design → tasks)
        │  tasks.md が実行層への入力になる
        ▼
[実行層] git / Linear / CI-CD
  feature(/fix) ブランチ → 細かいコミット
  → PR (DATTI-xxx) → CI (pr-check) → main マージ → 自動デプロイ (merge-to-main)
```

- **計画層 (Kiro SDD)**: 「何を・なぜ・どう作るか」を仕様化する。成果物は `.kiro/specs/<feature>/` の `requirements.md` / `design.md` / `tasks.md`。詳細は本書末尾の [Agentic SDLC and Spec-Driven Development](#agentic-sdlc-and-spec-driven-development) を参照。
- **実行層 (git/Linear/CI-CD)**: 計画層が出力した tasks を実際のコード変更として届ける。コミット粒度・PR・チケット連携・デプロイのルールはすべて実行層に一本化されており、`## 開発フロー` 以降が唯一の正となる。
- **橋渡し**: spec の `tasks.md` を実装するときは、必ず実行層のコミット/PR/Linear ルール（後述）に従う。計画層は「単位を決める」だけで、届け方は常に実行層が担う。

### 計画層を使う単位

- **spec を作る**: 新機能や複数ファイル・複数ドメインにまたがる変更（おおむね `/kiro-discovery` が新規 spec と判定する規模）。
- **spec を作らず実行層へ直接**: バグ修正・設定変更・小さなリファクタなど、仕様化の価値が低い変更。
- 迷ったら `/kiro-discovery "やりたいこと"` に判定させる。

> 規模ごとの厳密な判定基準のルール化は今後の課題。現状は上記の目安と `/kiro-discovery` の判定に従う。

## 対応づけ（Linear ↔ Kiro ↔ git）

2 つの追跡（Linear と Kiro spec）が並走しないよう、粒度を対応させる。

| 計画層 | 追跡 | 実行層 |
|--------|------|--------|
| 1 spec (`.kiro/specs/<feature>/`) | ≒ 1 Linear チケット (`DATTI-xxx`) | 1 本以上の PR |
| spec 内の 1 task (`tasks.md`) | — | 1 コミット（または関連ファイルをまとめた最小単位） |

- spec を起点にした作業でも、PR タイトルには対応する `DATTI-xxx` を含めて Linear と連携する。
- spec を伴わない直接作業は、従来どおり Linear チケット単位で進める。

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

## 開発フロー（実行層・単一ソース）

ここがコミット・PR を含む実行層ルールの唯一の正。**Kiro spec の tasks を実装する場合も、spec を伴わない直接作業の場合も、共通してこのルールに従う。**

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
- [公開ドキュメント](https://openapi.datti.app) - API仕様書


# Agentic SDLC and Spec-Driven Development

Kiro-style Spec-Driven Development on an agentic SDLC

これは本リポジトリの **計画層** の詳細ルール。実行層（コミット・PR・Linear・デプロイ）との関係は本書冒頭の [開発フローの全体像（計画層と実行層）](#開発フローの全体像計画層と実行層) を参照。

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro-spec-status [feature-name]` to check progress

## Development Guidelines
- 思考は任意の言語で行ってよいが、**ユーザーへの応答は常に日本語**（グローバル設定に従う）。
- spec の成果物（`requirements.md` / `design.md` / `tasks.md` / `research.md` / validation report 等）は、その spec の `spec.json.language` で設定された言語で書く。

## Minimal Workflow
- Phase 0 (optional): `/kiro-steering`, `/kiro-steering-custom`
- Discovery: `/kiro-discovery "idea"` — determines action path, writes brief.md + roadmap.md for multi-spec projects
- Phase 1 (Specification):
  - Single spec: `/kiro-spec-quick {feature} [--auto]` or step by step:
    - `/kiro-spec-init "description"`
    - `/kiro-spec-requirements {feature}`
    - `/kiro-validate-gap {feature}` (optional: for existing codebase)
    - `/kiro-spec-design {feature} [-y]`
    - `/kiro-validate-design {feature}` (optional: design review)
    - `/kiro-spec-tasks {feature} [-y]`
  - Multi-spec: `/kiro-spec-batch` — creates all specs from roadmap.md in parallel by dependency wave
- Phase 2 (Implementation): `/kiro-impl {feature} [tasks]`
  - Without task numbers: autonomous mode (subagent per task + independent review + final validation)
  - With task numbers: manual mode (selected tasks in main context, still reviewer-gated before completion)
  - `/kiro-validate-impl {feature}` (standalone re-validation)
- Progress check: `/kiro-spec-status {feature}` (use anytime)

## Skills Structure
Skills are located in `.claude/skills/kiro-*/SKILL.md`
- Each skill is a directory with a `SKILL.md` file
- Skills run inline with access to conversation context
- Skills may delegate parallel research to subagents for efficiency
- Additional files (templates, examples) can be added to skill directories
- `kiro-review` — task-local adversarial review protocol used by reviewer subagents
- `kiro-debug` — root-cause-first debug protocol used by debugger subagents
- `kiro-verify-completion` — fresh-evidence gate before success or completion claims
- **If there is even a 1% chance a skill applies to the current task, invoke it.** Do not skip skills because the task seems simple.

## Development Rules
- **承認ゲートの位置づけ（二重承認にしない）**:
  - 計画層のゲート = この 3-phase approval（Requirements → Design → Tasks）。各フェーズで人間レビューが必要。意図的な fast-track のときだけ `-y`。
  - 実行層のゲート = `## 作業開始前の確認`（ブランチ確認・プラン共有と承認）。tasks 実装に着手する段階で適用する。
  - つまり「何を作るか」は計画層で、「どう着手するか」は実行層で承認を取る。同じ内容を二度承認しない。
- **実行層への橋渡し**: `/kiro-impl` 等で tasks を実装する際のコミット・PR・Linear 連携は、本書前半の `## 開発フロー` / `## PRの作成` / `## 対応づけ` に従う（Kiro 側で独自のコミット/PR ルールを定義しない）。
- Keep steering current and verify alignment with `/kiro-spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro-steering-custom`)
