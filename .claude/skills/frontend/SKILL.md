---
name: frontend
description: Dattiフロントエンド開発ガイド。Next.js App Router製のフロントエンド開発、フォーム実装、コンポーネント設計、スタイリングに関する標準フロー。新機能実装時に自動的に使用。
---

# Datti Frontend Development Skill

このスキルは、Datti Frontend（Next.js App Router製フロントエンド）の開発に必要な知識とワークフローを提供します。

## 概要

Dattiフロントエンドは「誰にいくら払ったか」を記録・共有するサービスのWebインターフェースです。Next.js App Router、React、TypeScript、Tailwind CSSを使用して構築されています。

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
// ❌NG: <a>の中に<button>を入れてはいけない
<Link href="/groups/1">
  <Button>開く</Button>
</Link>

// ✅OK: LinkButtonコンポーネントを使う
<LinkButton href="/groups/1">開く</LinkButton>
```

**理由**: HTMLの仕様上、`<a>`要素はインタラクティブコンテンツ（`<button>`, `<a>`, `<input>`など）を含むことができません。

### 2. `name` 属性は必須

FormDataに含めたい全ての入力要素に `name` 属性を設定する。

```tsx
// ❌NG: name属性がない
<input id={field.id} defaultValue={field.initialValue} />

// ✅OK: name属性を設定
<input name={field.name} id={field.id} defaultValue={field.initialValue} />
```

**理由**: これがないとServer ActionでFormDataを受け取れず、フォームが機能しません。

### 3. UIコンポーネントを使う

`Input`, `Button`, `LinkButton` コンポーネントを使用する。

```tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
```

**理由**: これらには重要なデフォルト設定が含まれています：
- **Input**: `autoComplete="off"`, `data-1p-ignore`（1Password無効化）
- **Button**: disabled状態のスタイル、React Aria対応
- **LinkButton**: ナビゲーション用の適切なセマンティクス

## アーキテクチャ

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

## 新機能実装フロー

1. **型定義とスキーマ定義**: `features/[feature]/types.ts`, `schema.ts`
2. **Server Actions 実装**: `features/[feature]/actions/`
3. **Page 実装 (Server Component)**: `app/(auth)/[path]/page.tsx`
4. **Component 実装 (Client Component)**: `features/[feature]/components/`
5. **スタイリング調整**: Tailwind CSS + cn()
6. **動作確認**: `pnpm dev`

### 重要なポイント

- **Server Actions**: `parseWithZod` → `submission.reply()` → `revalidatePath()`
- **Client Components**: `useActionState` + `useForm` で状態管理
- **UIコンポーネント**: `Input`, `Button`, `LinkButton` を使用

## フォーム実装パターン

### 基本構造: Conform + Zod + Server Actions

#### Step 1: スキーマ定義

```typescript
// features/group/schema.ts
import z from "zod";

export const updateGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "グループ名を入力してください"),
});
```

#### Step 2: Server Action 実装

```typescript
// features/group/actions/updateGroup.ts
"use server";

import { parseWithZod } from "@conform-to/zod";
import { updateGroupSchema } from "../schema";
import { revalidatePath } from "next/cache";
import { apiClient } from "@/libs/api/client";

export async function updateGroup(_: unknown, formData: FormData) {
  // 1. バリデーション
  const submission = parseWithZod(formData, {
    schema: updateGroupSchema,
  });
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { id, name } = submission.value;

  // 2. API呼び出し
  try {
    await apiClient.put(`/groups/${id}`, { name });

    // 3. キャッシュ再検証
    revalidatePath("/groups");

    // 4. 成功レスポンス
    return submission.reply({ resetForm: true });
  } catch (error) {
    // 5. エラーハンドリング
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }
}
```

#### Step 3: Client Component 実装

```typescript
// features/group/components/group-basic-info-form.tsx
"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { updateGroup } from "../actions/updateGroup";
import { updateGroupSchema } from "../schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import type { Group } from "../types";

type Props = {
  group: Group;
};

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
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
    >
      <input type="hidden" name={id.name} value={group.id} />

      <label htmlFor={name.id}>グループ名</label>
      <Input
        type="text"
        name={name.name}
        id={name.id}
        key={name.key}
        defaultValue={name.initialValue}
      />

      <Button type="submit" isDisabled={isPending}>
        {isPending ? "更新中..." : "更新"}
      </Button>
    </form>
  );
}
```

### useActionState の使い方

```typescript
const [lastResult, action, isPending] = useActionState(myAction, undefined);
```

- **lastResult**: Server Actionからの最新のレスポンス（エラー情報を含む）
- **action**: フォームのaction属性に渡す関数
- **isPending**: フォーム送信中かどうかのBoolean値

### useForm の使い方

```typescript
const [form, { field1, field2 }] = useForm({
  lastResult,              // Server Actionからのレスポンス
  defaultValue: initialData, // 初期値
  onValidate({ formData }) {  // クライアント側バリデーション
    return parseWithZod(formData, { schema: mySchema });
  },
});
```

- **form**: フォームのメタデータ（id, onSubmit, errors など）
- **fields**: 各フィールドのメタデータ（name, id, key, initialValue など）

### ローディング状態の管理

#### フォーム送信: useActionState

`isPending` を使用してボタンの disabled 状態とテキストを制御（上記「useActionState の使い方」参照）。

#### その他の非同期処理: useTransition

```typescript
const [isDeleting, startTransition] = useTransition();
const [deletingId, setDeletingId] = useState<string | null>(null);

const handleDelete = (id: string) => {
  setDeletingId(id);
  startTransition(async () => {
    await deleteAction(id);
    setDeletingId(null);
  });
};

<Button
  onPress={() => handleDelete(item.id)}
  isDisabled={isDeleting}
>
  {isDeleting && deletingId === item.id ? "削除中..." : "削除"}
</Button>
```

### エラーハンドリング

#### フォームエラー（Server Action からのエラー）

```typescript
// Server Action
return submission.reply({
  formErrors: ["エラーメッセージ"],
});

// Component
{form.errors && <ErrorText>{form.errors}</ErrorText>}
```

### 実装チェックリスト

#### スキーマ定義
- [ ] `features/[feature]/schema.ts` に Zod スキーマを定義
- [ ] エラーメッセージを日本語で記述

#### Server Action
- [ ] "use server" ディレクティブ
- [ ] `parseWithZod` でバリデーション
- [ ] submission.status チェック
- [ ] try-catch でエラーハンドリング
- [ ] submission.reply() でレスポンス
- [ ] revalidatePath() でキャッシュ更新

#### Client Component
- [ ] "use client" ディレクティブ
- [ ] useActionState + useForm を使用
- [ ] field.name, field.id, field.key, field.initialValue を設定
- [ ] isPending でローディング状態を管理
- [ ] `Input`, `Button` コンポーネントを使用

## コンポーネント設計パターン

### Server Component でデータフェッチ

```typescript
// app/(auth)/groups/[groupId]/settings/page.tsx
export default async function SettingsPage({ params }: Props) {
  const { groupId } = await params;

  const groupResult = await getGroup(groupId);
  if (!groupResult.success) {
    throw new Error(groupResult.error);
  }

  return (
    <div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1>グループ設定</h1>
      <GroupBasicInfoForm group={groupResult.result} />
    </div>
  );
}
```

### Client Component でインタラクション

```typescript
// features/group/components/group-member-management.tsx
"use client";

export function GroupMemberManagement({ groupId, members }: Props) {
  const [lastResult, action, isAdding] = useActionState(addMember, undefined);
  const [isDeleting, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={cn("p-6", "flex flex-col gap-6", "border rounded-lg")}>
      {/* フォームとインタラクション */}
    </div>
  );
}
```

### 1ファイルで完結

- 関連する処理は1つのファイルにまとめる
- 不要なコンポーネント分割をしない
- 200〜300行程度なら分割不要

### JSX設計パターン

#### 浅い階層を維持

```tsx
// ❌NG
<div className="container">
  <div className="wrapper">
    <div className="inner">
      <label>ラベル</label>
      <div className="input-wrapper">
        <input />
      </div>
    </div>
  </div>
</div>

// ✅OK
<div className="container">
  <label>ラベル</label>
  <input />
</div>
```

#### セマンティックな構造

```tsx
<form className={cn("p-6", "flex flex-col gap-6", "border rounded-lg")}>
  <h2>フォームタイトル</h2>

  <label htmlFor="name">名前</label>
  <input id="name" type="text" />

  <hr />

  <label htmlFor="email">メール</label>
  <input id="email" type="email" />

  <div className={cn("flex justify-end gap-2")}>
    <Button type="submit">送信</Button>
  </div>
</form>
```

## データ取得パターン

### Server Actionでの複数エンドポイント呼び出し

バックエンドAPIが `/users/{id}` のような個別エンドポイントのみを提供している場合のパターン。

#### 単一データの場合

```typescript
export async function getRepayment(id: string): Promise<Result<Repayment>> {
  try {
    const response = await apiClient.get<RepaymentResponse>(`/repayments/${id}`);

    // 関連ユーザーを並列取得
    const [payer, debtor] = await Promise.all([
      apiClient.get<User>(`/users/${response.payerId}`),
      apiClient.get<User>(`/users/${response.debtorId}`),
    ]);

    return {
      success: true,
      result: { ...response, payer, debtor },
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

#### 複数データの場合（重複排除）

```typescript
export async function getAllRepayments(): Promise<Result<Repayment[]>> {
  try {
    const responses = await apiClient.get<RepaymentResponse[]>("/repayments");

    // 重複を排除したユーザーIDリスト
    const userIds = new Set<string>();
    responses.forEach((r) => {
      userIds.add(r.payerId);
      userIds.add(r.debtorId);
    });

    // 全ユーザー情報を並列取得
    const users = await Promise.all(
      Array.from(userIds).map((id) => apiClient.get<User>(`/users/${id}`))
    );

    // O(1)検索用のマップ
    const userMap = new Map(users.map((user) => [user.id, user]));

    const repayments = responses.map((r) => ({
      ...r,
      payer: userMap.get(r.payerId)!,
      debtor: userMap.get(r.debtorId)!,
    }));

    return { success: true, result: repayments, error: null };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### 型設計パターン（Response型とフロントエンド型の分離）

```typescript
// features/repayment/types.ts

// バックエンドAPIのレスポンス型（IDのみ）
export type RepaymentResponse = {
  id: string;
  payerId: string;
  debtorId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

// フロントエンド型（完全なユーザーオブジェクト）
export type Repayment = {
  id: string;
  payer: User;
  debtor: User;
  amount: number;
  createdAt: string;
  updatedAt: string;
};
```

**メリット**:
- Server Actionでの変換が明示的
- 型安全性の向上（IDの誤使用を防ぐ）
- UIコンポーネントが常に完全なオブジェクトを前提にできる

## トラブルシューティング

### 1. FormDataが空になる

**原因**: `name` 属性の欠落

**デバッグ**:
```typescript
export async function myAction(_: unknown, formData: FormData) {
  console.log("FormData entries:", Array.from(formData.entries()));
}
```

### 2. APIが空レスポンスを返す（204 No Content）

**症状**: `Unexpected end of JSON input` エラー

**解決策**:
```typescript
const text = await response.text();
if (!text) {
  return null as T;
}
return JSON.parse(text) as T;
```

### 3. revalidatePathで画面が更新されない

**解決策**: 関連するパスを全て revalidate
```typescript
revalidatePath(`/groups/${id}/settings`);
revalidatePath("/groups");
```

### 4. Conformのフィールドが更新されない

**原因**: `key` 属性の欠落

```tsx
// ✅OK: keyを設定
<Input
  name={field.name}
  id={field.id}
  key={field.key}
  defaultValue={field.initialValue}
/>
```

### 5. useActionStateのisPendingが動作しない

**原因**: `action`属性に渡していない

```tsx
<form action={action} onSubmit={form.onSubmit}>
  <Button type="submit" isDisabled={isPending}>
    {isPending ? "送信中..." : "送信"}
  </Button>
</form>
```

### 6. 配列フィールドの追加・削除が動作しない（React Aria + Conform）

**原因**: Conformの`getButtonProps()`はReact Aria Buttonと互換性がない

```tsx
// ❌NG
<Button {...form.insert.getButtonProps({ name: fields.debts.name })}>

// ✅OK: onPressで直接呼び出す
<Button
  type="button"
  onPress={() => {
    form.insert({
      name: fields.debts.name,
      defaultValue: { userId: "", amount: 0 }
    });
  }}
>
  追加
</Button>
```

## 環境変数の変更ルール

環境変数を追加・変更する際は、以下の3ファイルを必ず確認・更新すること：

1. **`src/env.d.ts`** - 型定義を追加・更新
2. **`.env.example`** - サンプル値を追加・更新
3. **`Taskfile.yaml`** - LocalStackリソース（DynamoDB、S3など）に関連する場合は更新

### 命名規則

- `_NAME` サフィックスは不要（例: `S3_AVATAR_BUCKET`、`DYNAMODB_SESSIONS_TABLE`）
- ローカル開発用リソースは `local-` プレフィックス（例: `local-datti-avatar`）
- AWS SDKが自動読み取りする環境変数（`AWS_REGION`, `AWS_ACCESS_KEY_ID` 等）はソースコードで明示的に使用しない

```typescript
// ❌NG: AWS SDKが自動で読み取るので不要
const client = new S3Client({ region: process.env.AWS_REGION });

// ✅OK: 空オブジェクトで初期化
const client = new S3Client({});
```

## 避けるべきこと

- **過度な設計**: 要求された機能以外の追加や改善を避ける
- **過度なコンポーネント分割**: 小さすぎるコンポーネントに分割しない
- **不要なネスト**: div の入れ子を最小限に
- **早すぎる抽象化**: 1回限りの操作のためのヘルパーやユーティリティを作らない
- **手動の状態管理**: useActionState と Conform を使う
- **HTMLルール違反**: インタラクティブ要素のネストなど、MDNで確認すること

## 日付処理

**全ての日付処理はJST（Asia/Tokyo）で統一する。**

### 送信時

Server Actionで日付を送信する際は、JSTのISO形式で送信する。

```typescript
// yyyy-mm-dd形式をJSTのISO文字列に変換してAPIに渡す
body: {
  eventDate: `${eventDate}T00:00:00+09:00`,
}
```

### 表示時

日付を表示する際は、必ず `timeZone: "Asia/Tokyo"` を指定する。

```typescript
// ✅OK: タイムゾーン指定あり
new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Tokyo",
}).format(date);

// ✅OK: toLocaleStringでもタイムゾーン指定
new Date(dateString).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

// ❌NG: タイムゾーン指定なし（サーバーのTZに依存）
new Date(dateString).toLocaleString("ja-JP");
```

### 今日の日付を取得

```typescript
// JSTで今日の日付を取得（yyyy-mm-dd形式）
new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date())
```

### 表示用フォーマット

`@/utils/format` の `formatDate` を使用する。

```typescript
import { formatDate } from "@/utils/format";

formatDate(dateString);  // "2026年1月15日"
```

## コーディング規約

- **TypeScript**: strict モードを使用
- **フォーマット**: Biome でフォーマット
- **命名規則**:
  - コンポーネント: PascalCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
- **エラーハンドリング**: 明示的なエラー表示
- **バリデーション**: Zod スキーマで定義

## 参考資料

### Context7 で最新ドキュメントを参照

ライブラリのAPIを確認する際は `use context7` を使用すること。LLMの学習データより新しい情報を取得できる。

対象ライブラリ:
- **Conform** - フォームAPI（field.initialValue等）
- **Zod** - バリデーションスキーマ
- **Next.js** - App Router、Server Actions
- **React Aria Components** - データ属性、アクセシビリティ
- **Tailwind CSS** - ユーティリティクラス

### その他の参考資料

- [MDN Web Docs](https://developer.mozilla.org/ja/) - HTML仕様の確認
- [Design System Skill](../design-system/SKILL.md) - 間隔、UIコンポーネント仕様、スタイリング原則
- `frontend/src/features/group/components/group-basic-info-form.tsx` - フォーム実装の参考例
- `frontend/src/features/group/components/group-member-management.tsx` - 複雑なフォームの参考例
- `frontend/src/features/lending/components/lending-create-form.tsx` - 動的配列フォームの参考例
- `frontend/src/components/ui/` - UIコンポーネントの実装例
