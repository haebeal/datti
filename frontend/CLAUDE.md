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
- **UI コンポーネント**: shadcn/ui (Radix UI ベース)
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

`text-red-500` のような Tailwind デフォルトを直書きしない。`globals.css` 定義のトークンを使う:

- **shadcn セマンティック**: `bg-primary` / `bg-card` / `text-muted-foreground` / `text-destructive` / `border-border` など
- **Datti 固有**: `text-pos`(貸し) / `text-neg`(借り) / `text-ink` / `text-ink-2` / `border-hair` / `bg-surface` / `bg-surface-alt` / `text-key`
- **注意**: `--background` は canvas の**グレー**(#edeff2)。白いサーフェスには `bg-background` ではなく `bg-card`(白) を使う。

### 6. UI は shadcn/ui (radix-nova)、`components/ui/` は flat

- React Aria は使わない。プリミティブは shadcn CLI (`pnpm dlx shadcn@latest add ...`、preset は radix-nova) で追加。
- `components/ui/` は **flat 構成**（`dir/index.ts` 形式にしない）。shadcn プリミティブ(button/input/select/dialog…)も Datti 固有 composite(Money/Panel/UserAvatar/Monogram/FormField/ListGroup…)も全て flat な `.tsx` で並べる。
- `cn` は **`@/lib/utils`** から import（`@/utils/cn` は廃止済み）。
- デザインの正典は **Claude.ai の Claude Design** プロジェクト「Datti デザインシステム」。トークン→shadcn セマンティックのマッピングが定義されている。（旧 Pencil のローカルデザイン `design/*.pen` は廃止・削除済み）

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
├── lib/                       # cn (utils.ts) ← shadcn 標準
├── libs/
│   ├── api/                   # openapi-fetch client + 生成スキーマ
│   └── auth/                  # Cognito userManager + queries
├── utils/                     # format, form (getFieldErrorMessage)
└── styles/globals.css
```

## ルート命名

- `_authenticated.tsx` — pathless layout (ガードのみ、URLには出ない)
- `_authenticated/groups/$groupId/settings.tsx` — `/groups/$groupId/settings`
- `auth/index.tsx` — `/auth`
- `api/auth/cognito/callback.tsx` — OAuth コールバック (パスは Cognito 登録済みに合わせる)

## フォーム実装パターン (TanStack Form + Zod)

- 各フィールドは `FormField`(`@/components/ui/form-field`) でラップ: `label` / `htmlFor` / `error` / `hint` / `required` を渡すと「ラベル + コントロール + エラー(+補足)」が揃う。
- エラー整形は `getFieldErrorMessage`(`@/utils/form`) を使う（各フォームに再実装しない）。
- フォームは**コンテナ非依存**に作る（自前で card/見出しを持たない）。モーダルと全幅ルートの両方で再利用できるよう、Panel/PageHead は呼び出し側で付ける。
- 送信ボタンは shadcn `Button`（生 `<button>` を使わない）。

```tsx
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getFieldErrorMessage } from "@/utils/form";
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
        <FormField label="名前" htmlFor={field.name} error={getFieldErrorMessage(field.state.meta.errors)}>
          <Input
            id={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        </FormField>
      )}
    </form.Field>
    <form.Subscribe selector={(s) => s.isSubmitting}>
      {(isSubmitting) => <Button type="submit" disabled={isSubmitting}>...</Button>}
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

### Button

| 用途 | 指定 |
|------|------|
| 主要 CTA (送信・追加など) | `variant="default"` + `size="lg"` |
| 副次アクション (キャンセル・編集など) | `variant="outline"` (白地+罫線) |
| **破壊的操作** (削除・ログアウトなど) | **`variant="destructive"`**（白地+赤罫線の薄塗り。手書き className で赤くしない） |
| パネル内のコンパクト操作 | `size="sm"` |
| アイコンのみ | `size="icon"` / `size="icon-sm"` |

- サイズは **padding 基準**（`h-*`/`size-N` の固定高さは使わない）。高さは padding + font-size から決まる。
- variant マッピング: Primary→`default` / Secondary→`secondary` / 罫線→`outline` / Soft→`ghost`+`bg-accent` / Danger→`destructive` / Link→`link`。

### Dialog

shadcn `Dialog` を **Header / Body / Footer の3領域**で組む（DS のアナトミー準拠）。`DialogContent` 自体は padding を持たず、各領域が padding と hair 罫を持つ。**本文(`DialogBody`)だけが縦スクロール**し、Header/Footer は固定。

```tsx
<DialogContent className="sm:max-w-[480px]">  {/* 幅は 420/480/500/560 から中身の密度で選ぶ */}
  <DialogHeader><DialogTitle>…</DialogTitle></DialogHeader>
  <DialogBody>{/* 本文。スクロール領域 */}</DialogBody>
  <DialogFooter>{/* 任意。固定・右寄せ。主アクションは Primary 1つ */}</DialogFooter>
</DialogContent>
```

- Container: 角丸 20px・1px 罫線・`--shadow-modal`・max-h 88vh。Overlay は `--overlay`(青み暗幕)+blur。
- フォームをモーダルで使う場合、フォーム本体は `DialogBody` でラップする（送信/キャンセル行はフォーム側が持つ）。

### モーダル

Provider は使わない。トリガー箇所のローカル `useState` + shadcn Dialog で開閉する。中身のフォームはコンテナ非依存にして全幅ルートと共用する。

### ページレイアウト

`_authenticated.tsx` で `max-w-[1080px] mx-auto` を当てているので、ページ側で max-width 指定は不要。ページ見出しは `PageHead`(`@/components/ui/page-head`)、枠付きパネルは `Panel`/`PanelHead`(`@/components/ui/panel`) を使う。

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
pnpm build     # 本番ビルド (tsc -b && vite build) ← 型検査はこれで行う
pnpm typecheck # ルート tsconfig が files:[] で実質ノーチェック。使わない
pnpm lint      # Biome lint
pnpm format    # Biome format --write
pnpm gen:api   # openapi-typescript で schema.d.ts 再生成
```

**型検査は `pnpm build` を使う**（`pnpm typecheck` は実質ノーチェックのため）。

## 参考資料

ライブラリの API を確認する際は `use context7` を使用すること。

対象ライブラリ:
- **TanStack Router** - ルーター API、loader、beforeLoad、context
- **TanStack Query** - queryOptions、useSuspenseQuery、useMutation
- **TanStack Form** - useForm、Field、array mode
- **Zod** - バリデーションスキーマ
- **shadcn/ui / Radix UI** - コンポーネント API、データ属性、アクセシビリティ
- **Tailwind CSS v4** - `@theme`、`@plugin`
- **oidc-client-ts** - UserManager、events
