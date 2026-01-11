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

## 開発フロー

### ブランチ戦略

機能追加やバグ修正を行う際の標準的なワークフローです。

1. **ブランチ作成**
   ```bash
   git checkout -b feature/descriptive-name
   # または
   git checkout -b fix/bug-description
   ```

2. **実装とコミット**
   - タスクを細分化し、1つのタスクが完了したら即座にコミット
   - コミットメッセージは日本語・命令形で記述（例: `型定義を追加`, `Server Actionを実装`）
   - 生成物と元ファイルは同一コミットに含める（例: OpenAPI YAML + 生成された型定義）

3. **コミット例**
   ```bash
   git add frontend/src/features/repayment/types.ts
   git commit -m "型定義にRepaymentResponseを追加"

   git add frontend/src/features/repayment/actions/getRepayment.ts
   git commit -m "getRepaymentアクションでユーザー情報を並列取得"

   git add frontend/src/app/(auth)/repayments/[id]/page.tsx
   git commit -m "返済詳細ページでユーザー名を表示"
   ```

4. **PR作成前の確認**
   - [ ] すべてのタスクが完了している
   - [ ] ローカルで動作確認済み
   - [ ] コンパイルエラーがない
   - [ ] コミットメッセージが適切
   - [ ] 関連するissueがある場合は番号を確認

### 段階的なコミット戦略

**原則**: 1つのタスクが完了したら、次のタスクに移る前に必ずコミットする。

#### なぜ細かくコミットするのか

1. **リバートの容易性**: 問題が発生した際、特定のタスクだけを取り消せる
2. **レビューの明確性**: 各変更の意図が明確になり、レビュワーが理解しやすい
3. **デバッグの効率化**: どのコミットで問題が発生したか特定しやすい

#### 例: ユーザー表示改善タスク

以下のようなタスクリストがある場合：

1. 型定義を追加（RepaymentResponse, Repayment型の分離）
2. Server Actionを実装（getRepayment）
3. ページコンポーネントを更新（返済詳細ページ）
4. UIコンポーネントを更新（RepaymentCard）

**各タスク完了後にコミット**:

```bash
# タスク1完了
git add frontend/src/features/repayment/types.ts
git commit -m "型定義にRepaymentResponseを追加し、Repaymentにユーザーオブジェクトを含める"

# タスク2完了
git add frontend/src/features/repayment/actions/getRepayment.ts
git commit -m "getRepaymentアクションでユーザー情報を並列取得"

# タスク3完了
git add frontend/src/app/(auth)/repayments/[id]/page.tsx
git commit -m "返済詳細ページでユーザー名とアバターを表示"

# タスク4完了
git add frontend/src/features/repayment/components/repayment-card/repayment-card.tsx
git commit -m "RepaymentCardでアバター画像を表示"
```

#### コミットしてはいけないタイミング

- ビルドエラーがある状態
- 中途半端な実装（例: 型定義だけ変更してコンポーネントは未更新）
- テストが失敗している状態（テストを書いている場合）

ただし、**関連する複数ファイルの変更は1つのコミットにまとめる**こともあります：

```bash
# 型定義変更 + それに伴う全コンポーネントの更新を1コミット
git add frontend/src/features/repayment/types.ts \
        frontend/src/features/repayment/components/*.tsx \
        frontend/src/app/(auth)/repayments/*/page.tsx
git commit -m "Repayment型からIDを削除しユーザーオブジェクトに変更"
```

## PRの作成

### PR作成の手順（チェックリスト）

- [ ] **issueの確認**: `gh issue list` でissue番号を取得（例: #248）
- [ ] **PRタイトル**: `[DATTI-xxx] 簡潔な変更内容の説明` 形式にする
- [ ] **PR本文の先頭**: `closed #xxx` を記載（マージ時にissueが自動クローズ）
- [ ] **背景・実施内容**: 明確に記載されている
- [ ] **ローカル確認**: 動作確認済み、コンパイルエラーなし

### PR本文のフォーマット

```markdown
closed #xxx

# 背景

（なぜこの変更が必要だったのか、どんな課題があったのかを記載）

# 原因 (バグの場合)

（バグ修正の場合のみ記載。何が原因でバグが発生していたのかを説明）

# 実施内容

（具体的に何を実装・修正したのかを記載。複数ある場合は箇条書きで整理）

# 備考 (あれば)

（レビュワーに伝えておきたい補足情報や注意点があれば記載）
```

### PRの作成例

**タイトル**:
```
[DATTI-248] ユーザーID表示をユーザー名・アバター表示に改善
```

**本文**:
```markdown
closed #248

# 背景

現在、返済詳細ページやグループ一覧ページなどで、ユーザーIDが直接表示されており、
ユーザー体験が悪い状態でした。ユーザー名とアバターを表示することで、
より直感的で分かりやすいUIを実現する必要がありました。

# 実施内容

- 型定義の拡張
  - `RepaymentResponse`, `GroupResponse`, `CreditResponse` 型を追加（バックエンドAPIレスポンス用）
  - `Repayment`, `Group`, `Credit` 型を拡張してユーザーオブジェクトを含むように変更
- Server Actionの更新
  - `getRepayment`: 返済データとユーザー情報を並列取得
  - `getAllRepayments`: 重複排除してユーザー情報をバルク取得
  - `getGroup`, `getAllGroups`: グループ作成者情報を取得
  - `getAllCredits`: 貸し借りユーザー情報を取得
- UIコンポーネントの更新
  - 返済詳細/編集/一覧ページでユーザー名とアバターを表示
  - グループ一覧/設定ページで作成者名とメンバーアバターを表示
  - 支払いカードでアバター画像表示と色分け（青: 受取、赤: 支払）

# 備考

- バックエンドAPIには変更なし（フロントエンド内部のみで完結）
- 既存の型を変更したため、関連する全コンポーネントを一度に更新
```

### gh CLI を使用したPR作成

```bash
gh pr create --title "[DATTI-248] ユーザーID表示をユーザー名・アバター表示に改善" --body "$(cat <<'EOF'
closed #248

# 背景
（背景を記載）

# 実施内容
（実施内容を記載）
EOF
)"
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
