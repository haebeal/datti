# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

エージェントが作業を始める前に必ずこのファイルを確認し、最新の情報源として維持してください。READMEは人間向けの全体説明、本書はエージェントが即戦力として動くためのルールと手順をまとめたものです。

## 概要

Datti APIは「誰にいくら払ったか」を記録・共有するサービスのバックエンドです。Go製APIサーバーで、PostgreSQLを使用してユーザー間の立て替え支払いを管理します。

## 作業開始前の確認

- **ブランチ確認**: 作業対象ブランチ（例: `feature/...`）を事前に共有し、ユーザーの合意を取ってから着手する。
- **プラン共有と承認**: これから実施するタスクを細分化して説明し、OK をもらってから実行する。途中でステップを追加する場合も再度確認する。
- **進捗の扱い**: 標準フローのどこにいるかをこまめに共有し、次へ進む前に合意を得る。
- **未確定事項の管理**: 仕様が曖昧な点は TODO やメモとして残し、AGENTS.md に反映する（解消したら速やかに削除）。
- **コミットの粒度**: コミットは各タスクごとに後でリバートしやすい単位で細かく作成するようにしてください。

## PRの作成

プルリクエストを作成する際は、以下のフォーマットを使用してください：

```markdown
# 背景

（なぜこの変更が必要だったのか、どんな課題があったのかを記載）

# 原因 (バグの場合)

（バグ修正の場合のみ記載。何が原因でバグが発生していたのかを説明）

# 実施内容

（具体的に何を実装・修正したのかを記載。複数ある場合は番号付きリストで整理）

# 備考 (あれば)

（レビュワーに伝えておきたい補足情報や注意点があれば記載）
```

## リポジトリ構成

- `backend`: Go製APIサーバー本体
- `backend/openapi.yaml`: OpenAPI契約定義
- `infra`: Terraformによるインフラ構成管理
- `.devcontainer`: VS Code Dev Container用設定

## バックエンド開発

**バックエンドタスクを実行する際は、バックエンドスキルが自動的に適用されます。**

詳細なアーキテクチャ、実装フロー、テスト方針については以下を参照：

- 📚 **[Backend Skill](.claude/skills/backend/SKILL.md)** - 新機能実装フロー、開発ルール
- 🏗️ **[Architecture](.claude/skills/backend/architecture.md)** - アーキテクチャ詳細
- ⚙️ **[Commands](.claude/skills/backend/commands.md)** - セットアップと開発コマンド
- 🧪 **[Testing](.claude/skills/backend/testing.md)** - テスト方針と実装例

## クイックスタート

```bash
# 1. コンテナ起動
docker compose up -d

# 2. バックエンドセットアップ
cd backend
go mod download
cp .env.example .env
task db-migrate
task db-seed

# 3. 開発サーバー起動
air
```

詳細なセットアップ手順は [Commands](.claude/skills/backend/commands.md) を参照。

## よく使うコマンド

```bash
# OpenAPI 定義
# backend/openapi.yaml を編集

# コード生成
task gen-sqlc gen-api gen-mocks

# データベース
task db-migrate db-seed

# テスト（ユーザーから指示があった場合のみ）
task test
```

全コマンドは [Commands](.claude/skills/backend/commands.md) を参照。

## 参考資料

- 📖 **[OpenAPI仕様](backend/openapi.yaml)** - API契約定義
- 🌐 **[公開ドキュメント](https://haebeal.github.io/datti-api)** - API仕様書
- 🎯 **[Backend Skill](.claude/skills/backend/)** - バックエンド開発ガイド
