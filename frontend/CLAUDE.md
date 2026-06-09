# Frontend CLAUDE.md

Datti フロントエンド固有のコンテキスト。

## 技術スタック

- **パッケージマネージャー**: pnpm
- **ビルドツール**: Vite
- **言語**: TypeScript 5
- **ルーティング**: TanStack Router (file-based)
- **データ取得・キャッシュ**: TanStack Query
- **フォーム**: TanStack Form + Zod
- **スタイリング**: Tailwind CSS v4
- **UI コンポーネント**: React Aria Components
- **認証**: oidc-client-ts (Cognito PKCE)
- **API クライアント**: openapi-fetch (`pnpm gen:api` で `../backend/openapi.yaml` からスキーマ再生成)
- **画像圧縮**: browser-image-compression
- **Lint/Format**: Biome

## 絶対に守るべきルール

### 1. データ取得は loader + ensureQueryData

`useEffect` + `useState` でデータ取得しない。ルート定義の `loader` で `queryClient.ensureQueryData(queryOptions(...))` を呼び、コンポーネントは `useSuspenseQuery` で読む。

```tsx
export const Route = createFileRoute("/_authenticated/groups/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions),
  component: GroupsPage,
});

function GroupsPage() {
  const { data: groups } = useSuspenseQuery(groupsQueryOptions);
  // ...
}
```

### 2. 認証ガードは beforeLoad

```tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const user = await userManager.getUser();
    if (!user || user.expired) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
  },
  component: AuthenticatedLayout,
});
```

### 3. ローディング UI は defaultPendingComponent

`useState`/`useEffect` でロード状態を作らない。Router の `defaultPendingComponent` (or ルートの `pendingComponent`) を使う。

### 4. hooks を増やしすぎない

長寿命のシングルトン状態 (認証ユーザーなど) は Context/Provider ではなく、シングルトン (例: `oidc-client-ts` の `UserManager`) を直接エクスポートし、`queryOptions` で TanStack Query 化する。コンポーネントは `useQuery(authUserQueryOptions)` で読む。

### 5. セマンティックカラーを使う

`text-red-500` のような Tailwind デフォルトではなく、`globals.css` で定義された `text-error-base` 等を使う。

## ディレクトリ構造

```
src/
├── routes/                    # TanStack Router file-based
│   ├── __root.tsx
│   ├── _authenticated.tsx     # 認証ガード + Layout
│   ├── _authenticated/        # 認証必須ページ
│   │   ├── index.tsx          # /
│   │   ├── groups/
│   │   ├── repayments/
│   │   └── profile.tsx
│   ├── auth/                  # ログインページ
│   └── api/auth/cognito/      # OAuth callback
├── components/                # 共通コンポーネント
│   ├── ui/                    # Button, Input, Select, ...
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── mobile-menu.tsx
├── features/                  # 機能別
│   ├── credit/{types,queries}.ts
│   ├── group/{types,schema,queries,mutations,components}/
│   ├── lending/...
│   ├── repayment/...
│   └── user/...
├── libs/
│   ├── api/                   # openapi-fetch client + 生成スキーマ
│   └── auth/                  # Cognito userManager + queries
├── hooks/
├── utils/                     # cn, format
└── styles/globals.css
```

## ルート命名

- `_authenticated.tsx` — pathless layout (ガードのみ、URLには出ない)
- `_authenticated/groups/$groupId/settings.tsx` — `/groups/$groupId/settings`
- `auth/index.tsx` — `/auth`
- `api/auth/cognito/callback.tsx` — OAuth コールバック (パスは Cognito 登録済みに合わせる)

## フォーム実装パターン (TanStack Form + Zod)

```tsx
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1, "...") });

const form = useForm({
  defaultValues: { name: "" },
  validators: { onChange: schema },
  onSubmit: async ({ value }) => { await mutation.mutateAsync(value); },
});

return (
  <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
    <form.Field name="name">
      {(field) => (
        <Input
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
        />
      )}
    </form.Field>
    <form.Subscribe selector={(s) => s.isSubmitting}>
      {(isSubmitting) => <button type="submit" disabled={isSubmitting}>...</button>}
    </form.Subscribe>
  </form>
);
```

### 動的配列フィールド

```tsx
<form.Field name="debts" mode="array">
  {(field) => (
    <>
      {field.state.value.map((_, i) => (
        <form.Field key={i} name={`debts[${i}].amount`}>...</form.Field>
      ))}
      <button onClick={() => field.pushValue({ userId: "", amount: 0 })}>追加</button>
    </>
  )}
</form.Field>
```

## API クライアント

- `src/libs/api/client.ts` — openapi-fetch クライアント。`onRequest` で `userManager.getUser()` から access_token を取得して `Authorization: Bearer` を付与
- `src/libs/api/schema.d.ts` — openapi.yaml から自動生成。`pnpm gen:api` で更新
- 各 feature の `queries.ts` で `queryOptions(...)` を、`mutations.ts` で `useMutation` を定義

## 認証フロー

1. `/auth` で「Googleで続ける」ボタン → `login("Google")` → `userManager.signinRedirect(...)` で Cognito Hosted UI へ
2. Cognito 認証後、`/api/auth/cognito/callback` にリダイレクト (PKCE 検証つき)
3. callback ルートの `loader` で `userManager.signinRedirectCallback()` → 完了で `/` へ redirect
4. 以降、`_authenticated.tsx` の `beforeLoad` で認証状態を確認

## アバターアップロード (Presigned URL)

1. ファイル選択 → `browser-image-compression` で webp 1MB に圧縮
2. `POST /users/me/avatar/upload-url` で署名付きURL取得 (有効期限5分)
3. その URL に PUT で直接 S3 アップロード
4. `PUT /users/me` で avatar URL を保存

## デザインシステム

### カラー (globals.css `@theme`)

| カテゴリ | トークン |
|----------|----------|
| Primary | `primary-hover` / `primary-base` / `primary-active` / `primary-surface` |
| Accent | `accent-hover` / `accent-base` / `accent-active` |
| Success | `success-hover` / `success-base` / `success-active` (プラス金額) |
| Error | `error-hover` / `error-base` / `error-active` (マイナス金額) |

### スペーシング規約

| 用途 | クラス |
|------|--------|
| フォームコンテナのパディング | `p-6` |
| フォーム要素の縦間隔 | `gap-3` |
| ページセクション間 | `gap-5` |

### ページレイアウト

```tsx
<div className="flex flex-col gap-5">
  <h1 className="hidden sm:block text-2xl font-bold text-primary-base">...</h1>
  ...
</div>
```

`_authenticated.tsx` で `max-w-[800px] mx-auto` を当てているので、ページ側で max-width 指定は不要。

## 日付処理

**全ての日付処理は JST (Asia/Tokyo) で統一する。**

```typescript
// 送信時: JST の ISO 形式
body: { eventDate: `${eventDate}T00:00:00+09:00` }

// 表示用
import { formatDate } from "@/utils/format";
formatDate(dateString);  // "2026年1月15日"
```

## コマンド

```bash
pnpm dev       # 開発サーバー
pnpm build     # 本番ビルド (tsc -b && vite build)
pnpm typecheck # tsc --noEmit
pnpm lint      # Biome lint
pnpm format    # Biome format --write
pnpm gen:api   # openapi-typescript で schema.d.ts 再生成
```

## 参考資料

ライブラリの API を確認する際は `use context7` を使用すること。

対象ライブラリ:
- **TanStack Router** - ルーター API、loader、beforeLoad、context
- **TanStack Query** - queryOptions、useSuspenseQuery、useMutation
- **TanStack Form** - useForm、Field、array mode
- **Zod** - バリデーションスキーマ
- **React Aria Components** - データ属性、アクセシビリティ
- **Tailwind CSS v4** - `@theme`、`@plugin`
- **oidc-client-ts** - UserManager、events
