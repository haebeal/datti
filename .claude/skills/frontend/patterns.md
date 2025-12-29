# フロントエンド実装パターン詳細

このドキュメントは、Dattiフロントエンドの具体的な実装パターンとベストプラクティスをまとめたものです。

## 1. フォーム実装パターン

### 基本構造: Conform + Zod + Server Actions

Conformは型安全なフォーム管理ライブラリで、ZodスキーマとServer Actionsと組み合わせて使用します。

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
import { cn } from "@/utils/cn";
import type { Group } from "../types";

type Props = {
  group: Group;
};

export function GroupBasicInfoForm({ group }: Props) {
  // useActionState でフォーム送信とローディング状態を管理
  const [lastResult, action, isPending] = useActionState(
    updateGroup,
    undefined
  );

  // useForm でフィールド管理とバリデーション
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
      <h2 className={cn("text-lg font-semibold")}>基本情報</h2>

      <input
        type="hidden"
        id={id.id}
        key={id.key}
        value={group.id}
        hidden
        readOnly
      />

      <label htmlFor={name.id} className={cn("text-sm")}>
        グループ名
      </label>

      <input
        type="text"
        id={name.id}
        key={name.key}
        defaultValue={name.defaultValue}
        className={cn(
          "w-full px-3 py-2",
          "border rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base"
        )}
      />

      <Button type="submit" isDisabled={isPending}>
        {isPending ? "更新中..." : "更新"}
      </Button>
    </form>
  );
}
```

### ポイント解説

#### useActionState の使い方

```typescript
const [lastResult, action, isPending] = useActionState(myAction, undefined);
```

- **lastResult**: Server Actionからの最新のレスポンス（エラー情報を含む）
- **action**: フォームのaction属性に渡す関数
- **isPending**: フォーム送信中かどうかのBoolean値

#### useForm の使い方

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
- **fields**: 各フィールドのメタデータ（id, key, defaultValue など）

#### フィールドの設定

```typescript
<input
  type="text"
  id={name.id}           // フィールドの一意なID
  key={name.key}         // Reactのkey（値が変わったら再レンダリング）
  defaultValue={name.defaultValue}  // 初期値
/>
```

- **id**: label と input を紐付けるための一意なID
- **key**: 値が変わったときにReactが要素を再作成するためのkey
- **defaultValue**: 初期値（controlled componentではなくuncontrolled component）

## 2. ローディング状態の管理

### フォーム送信: useActionState

```typescript
const [lastResult, action, isPending] = useActionState(myAction, undefined);

<Button type="submit" isDisabled={isPending}>
  {isPending ? "送信中..." : "送信"}
</Button>
```

### その他の非同期処理: useTransition

```typescript
import { useTransition, useState } from "react";

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

## 3. エラーハンドリング

### フォームエラー（Server Action からのエラー）

```typescript
// Server Action
return submission.reply({
  formErrors: ["エラーメッセージ"],
});

// Component
{form.errors && <ErrorText>{form.errors}</ErrorText>}
```

### 個別エラー（検索など）

```typescript
const [error, setError] = useState<string | null>(null);

try {
  const result = await searchAction();
  if (!result.success) {
    setError(result.error);
  }
} catch (error) {
  setError(error instanceof Error ? error.message : "Unknown error");
}

{error && <ErrorText>{error}</ErrorText>}
```

## 4. コンポーネント設計パターン

### パターン1: Server Component でデータフェッチ

```typescript
// app/(auth)/groups/[groupId]/settings/page.tsx
export default async function SettingsPage({ params }: Props) {
  const { groupId } = await params;

  // サーバー側でデータフェッチ
  const groupResult = await getGroup(groupId);
  if (!groupResult.success) {
    throw new Error(groupResult.error);
  }

  const membersResult = await getMembers(groupId);
  if (!membersResult.success) {
    throw new Error(membersResult.error);
  }

  return (
    <div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>グループ設定</h1>

      {/* Client Component にデータを渡す */}
      <GroupBasicInfoForm group={groupResult.result} />
      <GroupMemberManagement
        groupId={groupId}
        members={membersResult.result}
      />
    </div>
  );
}
```

### パターン2: Client Component でインタラクション

```typescript
// features/group/components/group-member-management.tsx
"use client";

import { useActionState, useTransition, useState } from "react";

export function GroupMemberManagement({ groupId, members }: Props) {
  // メンバー追加の状態管理
  const [lastResult, action, isAdding] = useActionState(addMember, undefined);

  // メンバー削除の状態管理
  const [isDeleting, startTransition] = useTransition();

  // 検索の状態管理
  const [searchQuery, setSearchQuery] = useState("");

  // ...

  return (
    <div className={cn("p-6", "flex flex-col gap-6", "border rounded-lg")}>
      {/* フォームとインタラクション */}
    </div>
  );
}
```

### パターン3: 1ファイルで完結

```typescript
// features/group/components/group-member-management.tsx
"use client";

export function GroupMemberManagement({ groupId, members }: Props) {
  // メンバー追加の状態管理
  const [lastResult, action, isAdding] = useActionState(...);

  // メンバー削除の状態管理
  const [isDeleting, startTransition] = useTransition();

  // 検索の状態管理
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      {/* メンバー追加フォーム */}
      <label>メンバーを追加</label>
      <input ... />

      {/* 検索結果 */}
      {searchResults.map(...)}

      {/* メンバー一覧 */}
      <h3>現在のメンバー</h3>
      {members.map(...)}
    </div>
  );
}
```

**ポイント:**
- 関連する処理は1つのファイルにまとめる
- 不要なコンポーネント分割をしない
- 多少冗長でも読みやすさを優先

## 5. JSX設計パターン

### パターン1: 浅い階層を維持

❌ **悪い例:**
```tsx
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
```

✅ **良い例:**
```tsx
<div className="container">
  <label>ラベル</label>
  <input />
</div>
```

### パターン2: Fragment を活用

❌ **悪い例:**
```tsx
{items.length > 0 && (
  <div className="list">
    {items.map(item => (
      <div key={item.id}>{item.name}</div>
    ))}
  </div>
)}
```

✅ **良い例:**
```tsx
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}

{/* または条件付きレンダリング */}
{items.length > 0 && (
  <>
    <h3>アイテム一覧</h3>
    {items.map(item => (
      <div key={item.id}>{item.name}</div>
    ))}
  </>
)}
```

### パターン3: セマンティックな構造

✅ **良い例:**
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

**ポイント:**
- label と input を直接の兄弟要素に
- セクションの区切りは `<hr />` で明示
- レイアウト目的でのみ `<div>` を使用

## 6. スタイリングパターン

### cn() ユーティリティの使用

```tsx
import { cn } from "@/utils/cn";

// 複数のクラスを結合
<div className={cn(
  "px-3 py-2",
  "border rounded-md",
  "focus:outline-none focus:ring-2"
)} />

// 条件付きスタイル
<div className={cn(
  "px-3 py-2",
  isError && "border-red-500",
  isDisabled && "opacity-50"
)} />
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

// ボタンコンテナ
<div className={cn("flex justify-end gap-2")}>
  <Button>キャンセル</Button>
  <Button>送信</Button>
</div>

// カード
<div className={cn("p-4", "border rounded-md")}>

// レイアウト
<div className={cn("flex gap-2")}>           // 横並び
<div className={cn("flex flex-col gap-3")}>  // 縦並び
```

## 7. 実装チェックリスト

新しいフォーム機能を実装する際のチェックリスト：

### スキーマ定義
- [ ] `features/[feature]/schema.ts` に Zod スキーマを定義
- [ ] バリデーションルールを設定
- [ ] エラーメッセージを日本語で記述

### Server Action
- [ ] "use server" ディレクティブ
- [ ] `parseWithZod` でバリデーション
- [ ] submission.status チェック
- [ ] try-catch でエラーハンドリング
- [ ] submission.reply() でレスポンス
- [ ] revalidatePath() または redirect() でキャッシュ更新

### Client Component
- [ ] "use client" ディレクティブ
- [ ] useActionState + useForm を使用
- [ ] field.id, field.key, field.defaultValue を設定
- [ ] isPending でローディング状態を管理
- [ ] Button コンポーネントを使用
- [ ] エラー表示

### JSX 構造
- [ ] 不要なネストを削除
- [ ] Fragment を活用
- [ ] セマンティックな構造
- [ ] cn() でスタイル統一

### 動作確認
- [ ] ローディング状態の確認
- [ ] エラーハンドリングの確認
- [ ] バリデーションの確認
- [ ] revalidatePath の動作確認

## 8. よくあるパターン

### パターン: 検索機能付きフォーム

```typescript
export function SearchForm({ onSelect }: Props) {
  // 検索状態
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // フォーム送信状態
  const [lastResult, action, isPending] = useActionState(submitAction, undefined);
  const [form, { itemId }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: mySchema });
    },
  });

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchError(null);

    const result = await searchAction({ query: searchQuery });

    if (result.success) {
      setSearchResults(result.result);
    } else {
      setSearchError(result.error);
    }

    setIsSearching(false);
  };

  const handleSelect = (id: string) => {
    // hidden input に値をセットしてフォーム送信
    const input = document.querySelector(`input[name="${itemId.name}"]`);
    if (input) {
      input.value = id;
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div>
      {/* 検索UI */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button onPress={handleSearch} isDisabled={isSearching}>
        {isSearching ? "検索中..." : "検索"}
      </Button>

      {/* 検索結果 */}
      {searchResults.map(item => (
        <Button key={item.id} onPress={() => handleSelect(item.id)}>
          選択
        </Button>
      ))}

      {/* hidden form */}
      <form ref={formRef} action={action} className="hidden">
        <input type="hidden" name={itemId.name} />
      </form>
    </div>
  );
}
```

### パターン: 削除機能

```typescript
export function ItemList({ items }: Props) {
  const [isDeleting, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`${name}を削除しますか？`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      await deleteAction(id);
      setDeletingId(null);
    });
  };

  return (
    <>
      {items.map(item => (
        <div key={item.id}>
          <p>{item.name}</p>
          <Button
            onPress={() => handleDelete(item.id, item.name)}
            isDisabled={isDeleting}
            color="error"
          >
            {isDeleting && deletingId === item.id ? "削除中..." : "削除"}
          </Button>
        </div>
      ))}
    </>
  );
}
```

## 9. 参考実装

完全な実装例：

- **基本的なフォーム**: `frontend/src/features/group/components/group-basic-info-form.tsx`
- **複雑なフォーム（検索+追加+削除）**: `frontend/src/features/group/components/group-member-management.tsx`
- **Server Actions**: `frontend/src/features/group/actions/`
- **スキーマ定義**: `frontend/src/features/group/schema.ts`

これらのファイルを参考に、同じパターンで実装を進めてください。
