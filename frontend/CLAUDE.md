# Frontend CLAUDE.md

Dattiフロントエンド固有のコンテキスト。汎用的なNext.js開発ガイドはプラグイン（nextjs-frontend-plugin）を参照。

## 技術スタック

- **パッケージマネージャー**: pnpm
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript 5
- **フォームライブラリ**: Conform + Zod
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: react-aria-components (Button等)
- **状態管理**: React hooks (useState, useTransition, useActionState)
- **Server Actions**: Next.js Server Actions

## 絶対に守るべき3つのルール

### 1. HTMLセマンティックルールの厳守

**CRITICAL**: 実装前に必ず[MDN](https://developer.mozilla.org/ja/)でHTML仕様を確認すること。

```tsx
// NG: <a>の中に<button>を入れてはいけない
<Link href="/groups/1">
  <Button>開く</Button>
</Link>

// OK: LinkButtonコンポーネントを使う
<LinkButton href="/groups/1">開く</LinkButton>
```

### 2. `name` 属性は必須

FormDataに含めたい全ての入力要素に `name` 属性を設定する。

```tsx
// NG: name属性がない
<input id={field.id} defaultValue={field.initialValue} />

// OK: name属性を設定
<input name={field.name} id={field.id} defaultValue={field.initialValue} />
```

### 3. UIコンポーネントを使う

```tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
```

## ディレクトリ構造

```
src/
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

## 新機能実装フロー

1. **型定義とスキーマ定義**: `features/[feature]/types.ts`, `schema.ts`
2. **Server Actions 実装**: `features/[feature]/actions/`
3. **Page 実装 (Server Component)**: `app/(auth)/[path]/page.tsx`
4. **Component 実装 (Client Component)**: `features/[feature]/components/`
5. **スタイリング調整**: Tailwind CSS + cn()
6. **動作確認**: `pnpm dev`

## フォーム実装パターン（Conform + Zod + Server Actions）

### スキーマ定義

```typescript
// features/group/schema.ts
import z from "zod";

export const updateGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "グループ名を入力してください"),
});
```

### Server Action

```typescript
// features/group/actions/updateGroup.ts
"use server";

import { parseWithZod } from "@conform-to/zod";
import { updateGroupSchema } from "../schema";
import { revalidatePath } from "next/cache";
import { apiClient } from "@/libs/api/client";

export async function updateGroup(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: updateGroupSchema });
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
    return submission.reply({ formErrors: [message] });
  }
}
```

### Client Component

```typescript
"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

export function GroupBasicInfoForm({ group }: Props) {
  const [lastResult, action, isPending] = useActionState(updateGroup, undefined);

  const [form, { id, name }] = useForm({
    lastResult,
    defaultValue: group,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateGroupSchema });
    },
  });

  return (
    <form id={form.id} onSubmit={form.onSubmit} action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
      <input type="hidden" name={id.name} value={group.id} />
      <label htmlFor={name.id}>グループ名</label>
      <Input type="text" name={name.name} id={name.id} key={name.key}
        defaultValue={name.initialValue} />
      <Button type="submit" isDisabled={isPending}>
        {isPending ? "更新中..." : "更新"}
      </Button>
    </form>
  );
}
```

### ローディング状態

- **フォーム送信**: `useActionState` の `isPending`
- **その他の非同期処理**: `useTransition`

```typescript
const [isDeleting, startTransition] = useTransition();
const handleDelete = (id: string) => {
  startTransition(async () => { await deleteAction(id); });
};
```

### エラーハンドリング

```typescript
// Server Action
return submission.reply({ formErrors: ["エラーメッセージ"] });

// Component
{form.errors && <ErrorText>{form.errors}</ErrorText>}
```

### 配列フィールド（React Aria + Conform）

```tsx
// NG: getButtonPropsはReact Aria Buttonと互換性がない
<Button {...form.insert.getButtonProps({ name: fields.debts.name })}>

// OK: onPressで直接呼び出す
<Button type="button" onPress={() => {
  form.insert({ name: fields.debts.name, defaultValue: { userId: "", amount: 0 } });
}}>
  追加
</Button>
```

## データ取得パターン

### 関連ユーザーの並列取得

```typescript
const [payer, debtor] = await Promise.all([
  apiClient.get<User>(`/users/${response.payerId}`),
  apiClient.get<User>(`/users/${response.debtorId}`),
]);
```

### 複数データの重複排除

```typescript
const userIds = new Set<string>();
responses.forEach((r) => { userIds.add(r.payerId); userIds.add(r.debtorId); });
const users = await Promise.all(Array.from(userIds).map((id) => apiClient.get<User>(`/users/${id}`)));
const userMap = new Map(users.map((user) => [user.id, user]));
```

### 型設計（Response型とフロントエンド型の分離）

```typescript
// バックエンドAPIのレスポンス型（IDのみ）
type RepaymentResponse = { id: string; payerId: string; debtorId: string; amount: number; };

// フロントエンド型（完全なユーザーオブジェクト）
type Repayment = { id: string; payer: User; debtor: User; amount: number; };
```

## 日付処理

**全ての日付処理はJST（Asia/Tokyo）で統一する。**

```typescript
// 送信時: JSTのISO形式
body: { eventDate: `${eventDate}T00:00:00+09:00` }

// 表示時: 必ずtimeZone指定
new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Tokyo" }).format(date);

// 今日の日付（yyyy-mm-dd）
new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date())

// 表示用フォーマット
import { formatDate } from "@/utils/format";
formatDate(dateString);  // "2026年1月15日"
```

## 環境変数の変更ルール

追加・変更時は以下の3ファイルを必ず確認・更新：

1. **`src/env.d.ts`** - 型定義
2. **`.env.example`** - サンプル値
3. **`Taskfile.yaml`** - LocalStackリソース関連の場合

### 命名規則

- `_NAME` サフィックスは不要（例: `S3_AVATAR_BUCKET`）
- ローカル開発用リソースは `local-` プレフィックス（例: `local-datti-avatar`）
- AWS SDKが自動読み取りする環境変数はソースコードで明示的に使用しない

---

## デザインシステム

### カラーパレット

定義ファイル: `src/app/globals.css`

| カテゴリ | トークン | 用途 |
|----------|----------|------|
| **Primary** | `primary-hover` / `primary-base` / `primary-active` / `primary-surface` | テキスト、ボタン、選択状態背景 |
| **Accent** | `accent-hover` / `accent-base` / `accent-active` | アクセントカラー |
| **Success** | `success-hover` / `success-base` / `success-active` | プラス金額、成功メッセージ |
| **Error** | `error-hover` / `error-base` / `error-active` | マイナス金額、エラーメッセージ |

**セマンティックカラーの使い分け**:
- 回収予定（+金額）: `text-success-base`
- 支払い予定（-金額）: `text-error-base`
- 選択状態の背景: `bg-primary-surface`
- ハードコードの色は使わない（`text-red-500` ではなく `text-error-base`）

### 間隔（Spacing）

| 用途 | クラス |
|------|--------|
| フォームコンテナのパディング | `p-6` |
| フォーム要素の縦間隔 | `gap-3` |
| 横並び要素の間隔 | `gap-5` |
| ページセクション間 | `gap-5` |
| カードのパディング（リスト） | `p-4` |
| カードのパディング（詳細） | `p-6` |

### ページレイアウト

```tsx
<div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
  <h1>ページタイトル</h1>
</div>
```

最大幅: `w-4xl`（896px）、中央揃え: `mx-auto`

### UIコンポーネント仕様

| コンポーネント | パス | 特徴 |
|----------------|------|------|
| **Input** | `components/ui/input/` | `autoComplete="off"`, `data-1p-ignore` |
| **DatePicker** | `components/ui/date-picker/` | React Aria Components ベース、hidden input でFormData対応 |
| **Select** | `components/ui/select/` | React Aria Components ベース、ジェネリック型 |
| **Button** | `components/ui/button/` | disabled状態のスタイル、React Aria対応 |
| **LinkButton** | `components/ui/link-button/` | ページ遷移・ナビゲーション用 |
| **ErrorText** | `components/ui/error-text/` | エラーメッセージ表示 |

### スタイリング原則

**入力コンポーネントの統一スタイル**:
```tsx
className={cn("px-3 py-2", "border rounded-md",
  "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base")}
```

**cn() ユーティリティ**: Tailwindクラスのグループ化と条件付きクラス管理に使用。

**React Aria Components**: CSS擬似クラスではなくデータ属性を使用。
```tsx
// NG: hover:bg-gray-100
// OK: data-[hovered]:bg-gray-100
```

## トラブルシューティング

| 問題 | 原因 | 解決策 |
|------|------|--------|
| FormDataが空 | `name` 属性の欠落 | `name={field.name}` を設定 |
| `Unexpected end of JSON input` | 204 No Content | `response.text()` で空チェック |
| revalidatePathで更新されない | パス不足 | 関連パスを全て revalidate |
| Conformフィールドが更新されない | `key` 属性の欠落 | `key={field.key}` を設定 |
| isPendingが動作しない | `action` 未設定 | `<form action={action}>` を設定 |

## コーディング規約

- **フォーマット**: Biome
- **命名規則**: コンポーネント=PascalCase、関数=camelCase、定数=UPPER_SNAKE_CASE
- **1ファイルで完結**: 200〜300行程度なら分割不要
- **浅い階層を維持**: 不要な div ネストを避ける

## 参考資料

ライブラリのAPIを確認する際は `use context7` を使用すること。

対象ライブラリ:
- **Conform** - フォームAPI（field.initialValue等）
- **Zod** - バリデーションスキーマ
- **Next.js** - App Router、Server Actions
- **React Aria Components** - データ属性、アクセシビリティ
- **Tailwind CSS** - ユーティリティクラス

参考実装:
- `src/features/group/components/group-basic-info-form.tsx` - フォーム実装
- `src/features/group/components/group-member-management.tsx` - 複雑なフォーム
- `src/features/lending/components/lending-create-form.tsx` - 動的配列フォーム
- `src/components/ui/` - UIコンポーネント
