---
name: frontend
description: Dattiフロントエンド開発ガイド。Next.js App Router製のフロントエンド開発、フォーム実装、コンポーネント設計、スタイリングに関する標準フロー。新機能実装時に自動的に使用。
---

# Datti Frontend Development Skill

このスキルは、Datti Frontend（Next.js App Router製フロントエンド）の開発に必要な知識とワークフローを提供します。

エージェントが作業を始める前に必ずこのスキルを参照し、最新の情報源として維持してください。

## 概要

Dattiフロントエンドは「誰にいくら払ったか」を記録・共有するサービスのWebインターフェースです。Next.js App Router、React、TypeScript、Tailwind CSSを使用して構築されています。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript 5
- **フォームライブラリ**: Conform + Zod
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: react-aria-components (Button等)
- **状態管理**: React hooks (useState, useTransition, useActionState)
- **Server Actions**: Next.js Server Actions

## アーキテクチャ

詳細は [patterns.md](patterns.md) を参照。

## デザインシステム

間隔、UIコンポーネント、統一デザイン原則については [design-system.md](design-system.md) を参照。

### ディレクトリ構造

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証が必要なページ
│   │   ├── page.tsx       # ダッシュボード
│   │   ├── groups/        # グループ関連
│   │   └── layout.tsx     # 認証レイアウト
│   ├── globals.css        # グローバルスタイル
│   └── layout.tsx         # ルートレイアウト
├── components/            # 共通UIコンポーネント
│   ├── ui/               # 汎用UIコンポーネント
│   ├── header/           # ヘッダー
│   └── sidebar/          # サイドバー
├── features/             # 機能別ディレクトリ
│   ├── group/           # グループ機能
│   │   ├── actions/     # Server Actions
│   │   ├── components/  # コンポーネント
│   │   ├── schema.ts    # Zodスキーマ
│   │   └── types.ts     # 型定義
│   ├── lending/         # 貸し出し機能
│   ├── repayment/       # 返済機能
│   └── user/            # ユーザー機能
├── libs/                # ライブラリ・ユーティリティ
│   └── api/            # APIクライアント
└── utils/              # ユーティリティ関数
```

### レイヤー構造

- **Page Layer (Server Component)**: データフェッチとルーティング
- **Component Layer (Client Component)**: UI とインタラクション
- **Action Layer (Server Actions)**: フォーム送信とデータ更新
- **API Layer**: バックエンドAPI呼び出し

## 作業開始前の確認

- **ブランチ確認**: 作業対象ブランチ（例: `feature/...`）を事前に共有し、ユーザーの合意を取ってから着手する
- **プラン共有と承認**: これから実施するタスクを細分化して説明し、OK をもらってから実行する。途中でステップを追加する場合も再度確認する
- **進捗の扱い**: 標準フローのどこにいるかをこまめに共有し、次へ進む前に合意を得る
- **未確定事項の管理**: 仕様が曖昧な点は TODO やメモとして残し、AGENTS.md に反映する（解消したら速やかに削除）

## 設計の核心原則

### 原則1: HTMLセマンティックルールを厳守する

**CRITICAL**: 実装前に必ずMDNでHTML仕様を確認すること。

#### インタラクティブ要素のネスト禁止

```tsx
// ❌NG: <a>の中に<button>を入れてはいけない
<Link href="/groups/1">
  <Button>開く</Button>
</Link>

// ✅OK: LinkButtonコンポーネントを使う
<LinkButton href="/groups/1">開く</LinkButton>
```

**理由**: HTMLの仕様上、`<a>`要素は[インタラクティブコンテンツ](https://developer.mozilla.org/ja/docs/Web/HTML/Content_categories#%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%83%96%E3%82%B3%E3%83%B3%E3%83%86%E3%83%B3%E3%83%84)（`<button>`, `<a>`, `<input>`など）を含むことができません。

#### LinkButtonパターン

ナビゲーションボタンが必要な場合は、Buttonスタイルを適用したLinkコンポーネントを使用します：

```tsx
// components/ui/link-button/link-button.tsx
import Link from "next/link";
import { cn } from "@/utils/cn";

export function LinkButton(props) {
  const { color = "primary", colorStyle = "fill", className, children, ...rest } = props;

  return (
    <Link
      className={cn(
        "px-4 py-2",
        "rounded-md",
        getColorClasses(color, colorStyle),
        "transition-colors",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
```

### 原則2: コンポーネント分割は最小限に

#### 分割すべきケース

- **サーバー/クライアント境界**: データフェッチ（Server Component）とインタラクション（Client Component）の分離
- **明確な責務の分離**: 独立した機能単位（例: BasicInfoForm と MemberManagement）

#### 分割すべきでないケース

- **UI の細かい部品**: 多少冗長でも1ファイルにまとめる
- **200〜300行程度のファイル**: この程度なら分割不要
- **1回しか使わないコンポーネント**: 早すぎる抽象化を避ける

### 原則3: 浅いJSX階層を維持する

```tsx
// ❌NG: 不要なネスト
<div>
  <div>
    <label>名前</label>
  </div>
  <div>
    <input />
  </div>
</div>

// ✅OK: 浅い階層
<label>名前</label>
<input />

// ✅OK: Fragmentも不要なら使わない
{groups.length === 0 ? (
  <EmptyState />
) : (
  // Fragmentは不要（mapは配列を返す）
  groups.map((group) => <GroupCard key={group.id} group={group} />)
)}
```

**Biomeの警告に従う**: `noUselessFragments` などのリンタールールを遵守すること。

### 原則4: スペーシングの一貫性とコンテンツベースの調整

#### 一貫性のルール

- **同じ性質の要素間**: 同じgapを使用（例: フォームのラベルと入力は常に `gap-3`）
- **セクション間**: `gap-5` を基本とする

#### コンテンツ密度による調整

```tsx
// 情報密度が高いフォームカード: p-6
<form className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
  {/* 多くのフィールド、ラベル、ボタン */}
</form>

// 情報密度が低い一覧カード: p-4
<div className={cn("p-4", "flex flex-col gap-3", "border rounded-lg")}>
  {/* タイトル、1行の説明、ボタン */}
</div>
```

**ガイドライン**: 内容量が少ないカードには小さいパディング（p-4）、フォームなど内容量が多いものには大きいパディング（p-6）を使用する。

## 新機能実装フロー

Server Componentを起点とし、外から内へ層を実装する標準フロー：

### 1. 型定義とスキーマ定義

データ構造を最初に定義します。

```bash
# features/[feature]/types.ts に型定義を追加
# features/[feature]/schema.ts に Zod スキーマを追加
```

**実装内容**:

- APIレスポンスの型を定義
- フォーム入力の型を定義
- Zodスキーマでバリデーションルールを定義

**例**:

```typescript
// types.ts
export type Group = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// schema.ts
import z from "zod";

export const updateGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "グループ名を入力してください"),
});
```

### 2. Server Actions 実装

フォーム送信やデータ更新のロジックを実装します。

```bash
# features/[feature]/actions/ に Server Action を追加
```

**実装内容**:

- "use server" ディレクティブ
- parseWithZod でバリデーション
- submission.status チェック
- try-catch でエラーハンドリング
- submission.reply() でレスポンス
- revalidatePath() または redirect() でキャッシュ更新・ページ遷移

**例**:

```typescript
"use server";

import { parseWithZod } from "@conform-to/zod";
import { updateGroupSchema } from "../schema";
import { revalidatePath } from "next/cache";

export async function updateGroup(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: updateGroupSchema,
  });
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { id, name } = submission.value;

  try {
    await apiClient.put(`/groups/${id}`, { name });
    revalidatePath("/groups");
    return submission.reply({ resetForm: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }
}
```

### 3. Page 実装 (Server Component)

データフェッチとレイアウトを実装します。

```bash
# app/(auth)/[path]/page.tsx を作成・更新
```

**実装内容**:

- Server Component でデータフェッチ
- エラーハンドリング
- Client Component にデータを渡す

**例**:

```typescript
export default async function SettingsPage({ params }: Props) {
  const { groupId } = await params;

  const groupResult = await getGroup(groupId);
  if (!groupResult.success) {
    throw new Error(groupResult.error);
  }

  return (
    <div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>グループ設定</h1>
      <GroupBasicInfoForm group={groupResult.result} />
    </div>
  );
}
```

### 4. Component 実装 (Client Component)

UIとインタラクションを実装します。

```bash
# features/[feature]/components/ にコンポーネントを追加
```

**実装内容**:

- "use client" ディレクティブ
- useActionState + useForm でフォーム管理
- **CRITICAL: `name` 属性は必須**（これがないとFormDataが空になる）
- field.id, field.key, field.defaultValue を設定
- isPending でローディング状態を管理
- Button / Input コンポーネントを使用
- エラー表示

**例**:

```typescript
"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GroupBasicInfoForm({ group }: Props) {
  const [lastResult, action, isPending] = useActionState(
    updateGroup,
    undefined
  );

  const [form, { id, name }] = useForm({
    lastResult,
    defaultValue: group,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateGroupSchema });
    },
  });

  return (
    <form id={form.id} onSubmit={form.onSubmit} action={action}>
      {/* CRITICAL: hidden inputにもname属性が必要 */}
      <input type="hidden" name={id.name} value={group.id} readOnly />

      <label htmlFor={name.id}>グループ名</label>
      <Input
        type="text"
        name={name.name}  // CRITICAL: この属性がないとFormDataに含まれない
        id={name.id}
        key={name.key}
        defaultValue={name.defaultValue}
      />

      <Button type="submit" isDisabled={isPending}>
        {isPending ? "更新中..." : "更新"}
      </Button>
    </form>
  );
}
```

#### フォーム実装の必須チェックリスト

- [ ] **`name` 属性**を全てのinput/select/textareaに設定（最重要）
- [ ] `id`, `key`, `defaultValue` を設定
- [ ] `Input` コンポーネントを使用（autoComplete="off", data-1p-ignore が適用される）
- [ ] エラーメッセージ表示
- [ ] ローディング状態（isPending）の表示

### 5. スタイリング調整

Tailwind CSSで一貫したスタイルを適用します。

**実装内容**:

- cn() ユーティリティで条件付きクラス結合
- 一貫したスタイルパターンを使用
- 不要なネストを避ける

### 6. 動作確認

実装完了後、必ず動作確認を行います。

```bash
cd frontend
pnpm dev
```

## UIコンポーネントの使用

### Input コンポーネント

全ての入力フィールドは `Input` コンポーネントを使用すること：

```tsx
import { Input } from "@/components/ui/input";

<Input
  type="text"
  name={field.name}  // CRITICAL
  id={field.id}
  defaultValue={field.defaultValue}
/>
```

**デフォルト設定**:
- `autoComplete="off"` - ブラウザの自動補完を無効化
- `data-1p-ignore` - 1Password拡張機能の補完を無効化
- フォーカス時のリングスタイル
- disabled状態のスタイル

### Button コンポーネント

```tsx
import { Button } from "@/components/ui/button";

// 基本的な使い方
<Button type="submit" isDisabled={isPending}>
  {isPending ? "送信中..." : "送信"}
</Button>

// カラーバリエーション
<Button color="primary" colorStyle="fill">Primary</Button>
<Button color="gray" colorStyle="outline">Gray Outline</Button>
<Button color="error" colorStyle="fill">Error</Button>
```

**disabled状態のスタイル**:
- `disabled:opacity-50` - 透明度を下げる
- `disabled:cursor-not-allowed` - カーソルを禁止マークに
- `disabled:hover:bg-[元の色]` - ホバー時も色が変わらない

### LinkButton コンポーネント

ナビゲーション用のボタンスタイルリンク：

```tsx
import { LinkButton } from "@/components/ui/link-button";

<LinkButton href="/groups/1" color="primary" colorStyle="fill">
  開く
</LinkButton>

<LinkButton href="/settings" color="gray" colorStyle="outline">
  設定
</LinkButton>
```

**使い分け**:
- `Button`: フォーム送信、モーダル操作など
- `LinkButton`: ページ遷移、ナビゲーション

## スタイリング規則

### Tailwind CSS の使い方

```tsx
import { cn } from "@/utils/cn";

<div
  className={cn(
    "px-3 py-2",
    "border rounded-md",
    "focus:outline-none focus:ring-2",
  )}
/>;
```

### 一貫したスタイルパターン

```tsx
// フォームコンテナ
<form className={cn("p-6", "flex flex-col gap-6", "border rounded-lg")}>

// 入力フィールド
<input className={cn(
  "px-3 py-2",
  "border rounded-md",
  "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base"
)} />

// カード
<div className={cn("p-4", "border rounded-md")}>
```

## よくあるピットフォールと対処法

### 1. FormDataが空になる

**症状**: Server Actionでフォームデータを受け取れない

**原因**: `name` 属性の欠落

**解決策**:
```tsx
// ❌NG
<input id={field.id} defaultValue={field.defaultValue} />

// ✅OK
<input name={field.name} id={field.id} defaultValue={field.defaultValue} />
```

### 2. APIが空レスポンスを返す（204 No Content）

**症状**: `Unexpected end of JSON input` エラー

**原因**: 空のレスポンスをJSON.parseしようとしている

**解決策**:
```typescript
// libs/api/client.ts
const text = await response.text();
if (!text) {
  return null as T;
}
return JSON.parse(text) as T;
```

### 3. disabled状態でもボタンの色が変わる

**症状**: 無効化されたボタンがホバーで色が変わる

**解決策**:
```tsx
className={cn(
  "bg-primary-base",
  "hover:bg-primary-hover",
  "disabled:hover:bg-primary-base",  // 元の色に戻す
  "disabled:opacity-50",
  "disabled:cursor-not-allowed"
)}
```

### 4. revalidatePathで画面が更新されない

**症状**: データ更新後、画面に反映されない

**原因**: 関連するパスを全て revalidate していない

**解決策**:
```typescript
// 設定ページと一覧ページの両方をrevalidate
revalidatePath(`/groups/${id}/settings`);
revalidatePath("/groups");
```

### 5. 1Password拡張機能の補完が邪魔

**症状**: フォーム入力時に1Passwordの候補が表示される

**解決策**: `Input` コンポーネントを使用（自動的に対応される）
```tsx
<Input
  type="text"
  // autoComplete="off" と data-1p-ignore が自動適用される
/>
```

### 6. HTMLセマンティックエラー（最重要）

**症状**: `<a>` の中に `<button>` を入れてしまう

**解決策**: `LinkButton` コンポーネントを使用
```tsx
// ❌NG
<Link href="/groups/1">
  <Button>開く</Button>
</Link>

// ✅OK
<LinkButton href="/groups/1">開く</LinkButton>
```

## コミットとログ

- **コミットメッセージは日本語・命令形で一意に作成**
- コミット前に AGENTS.md の該当セクション（特に「作業開始前の確認」や TODO）を最新化し、差分を残す
- **コミットは各タスクごとに後でリバートしやすい単位で細かく作成する**

## 避けるべきこと

- **過度な設計**: 要求された機能以外の追加や改善を避ける
- **過度なコンポーネント分割**: 小さすぎるコンポーネントに分割しない
- **不要なネスト**: div の入れ子を最小限に
- **早すぎる抽象化**: 1回限りの操作のためのヘルパーやユーティリティを作らない
- **手動の状態管理**: useActionState と Conform を使う
- **HTMLルール違反**: インタラクティブ要素のネストなど、MDNで確認すること

## 重要な実務ルール

### 実装の順序

1. 型定義とスキーマ定義
2. Server Actions 実装
3. Page 実装 (Server Component)
4. Component 実装 (Client Component)
5. スタイリング調整
6. 動作確認

**実装は外から内へ進める**: Page → Component → Actions の順を守る。

### フォーム実装の必須事項

- [ ] schema.ts に Zod スキーマを定義
- [ ] Server Action で parseWithZod を使用
- [ ] submission.reply() でエラーハンドリング
- [ ] revalidatePath() で関連する全てのパスをキャッシュ更新
- [ ] useActionState + useForm を使用
- [ ] **`name` 属性を全ての入力要素に設定**（最重要）
- [ ] field.id, field.key, field.defaultValue を設定
- [ ] isPending でローディング状態を管理
- [ ] `Input` コンポーネントを使用
- [ ] `Button` / `LinkButton` を適切に使い分け

### コーディング規約

- **TypeScript**: strict モードを使用
- **フォーマット**: Biome でフォーマット
- **命名規則**:
  - コンポーネント: PascalCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
- **エラーハンドリング**: 明示的なエラー表示
- **バリデーション**: Zod スキーマで定義

## 絶対に守るべき3つのルール

### 1. **HTMLセマンティックルールの厳守**
実装前に必ずMDNで確認する。特にインタラクティブ要素のネストは絶対に避ける。

### 2. **`name` 属性は必須**
FormDataに含めたい全ての入力要素に `name` 属性を設定する。これがないとServer Actionでデータを受け取れない。

### 3. **UIコンポーネントを使う**
`Input`, `Button`, `LinkButton` コンポーネントを使用する。これらには重要なデフォルト設定（1Password無効化、disabled状態のスタイルなど）が含まれている。

## 参考資料

- [patterns.md](patterns.md) - 実装パターンの詳細
- [design-system.md](design-system.md) - デザインシステムとUIコンポーネント
- [MDN Web Docs](https://developer.mozilla.org/ja/) - HTML仕様の確認
- [Conform公式ドキュメント](https://ja.conform.guide/) - フォームライブラリの最新API（バージョンアップで変わるため常に確認）
- `frontend/src/features/group/components/group-basic-info-form.tsx` - フォーム実装の参考例
- `frontend/src/features/group/components/group-member-management.tsx` - 複雑なフォームの参考例
- `frontend/src/features/lending/components/lending-create-form.tsx` - 動的配列フォームの参考例
- `frontend/src/components/ui/` - UIコンポーネントの実装例
