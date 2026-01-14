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

- **パッケージマネージャー**: pnpm
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

## デザインとコーディングの原則

### コンポーネント設計

- **最小限の分割**: サーバー/クライアント境界、明確な責務の分離のみ
- **浅いJSX階層**: 不要なネストを避け、Biomeの警告に従う
- **1ファイル完結**: 200〜300行程度なら分割不要

### スタイリング

- **間隔とレイアウト**: 詳細は [design-system.md](design-system.md) を参照
- **cn()ユーティリティ**: 全てのスタイルで使用
- **一貫性**: 同じ性質の要素には同じスタイルを適用

詳細な実装パターンとベストプラクティスは [patterns.md](patterns.md) を参照してください。

## 新機能実装フロー

**実装は外から内へ、以下の順序で進める**：

1. **型定義とスキーマ定義**: `features/[feature]/types.ts`, `schema.ts`
2. **Server Actions 実装**: `features/[feature]/actions/`
3. **Page 実装 (Server Component)**: `app/(auth)/[path]/page.tsx`
4. **Component 実装 (Client Component)**: `features/[feature]/components/`
5. **スタイリング調整**: Tailwind CSS + cn()
6. **動作確認**: `pnpm dev`

### 重要なポイント

- **Server Actions**: `parseWithZod` → `submission.reply()` → `revalidatePath()`
- **Client Components**: `useActionState` + `useForm` で状態管理
- **name属性**: **必須**（FormDataに含まれない原因No.1）
- **UIコンポーネント**: `Input`, `Button`, `LinkButton` を使用

詳細な実装パターン、コード例、チェックリストは [patterns.md](patterns.md) を参照してください。

## Server Actionでの複数エンドポイント呼び出しパターン

バックエンドAPIが `/users/{id}` のような個別エンドポイントのみを提供している場合、Server Actionで効率的に複数のユーザー情報を取得するパターンです。

### 単一データの場合

単一のデータ（例: 返済詳細）に関連するユーザー情報を並列取得します。

```typescript
export async function getRepayment(id: string): Promise<Result<Repayment>> {
  try {
    // 1. メインデータを取得
    const response = await apiClient.get<RepaymentResponse>(
      `/repayments/${id}`,
    );

    // 2. 関連ユーザーを並列取得（Promise.all）
    const [payer, debtor] = await Promise.all([
      apiClient.get<User>(`/users/${response.payerId}`),
      apiClient.get<User>(`/users/${response.debtorId}`),
    ]);

    // 3. 拡張データを返す
    const repayment: Repayment = {
      id: response.id,
      payer,
      debtor,
      amount: response.amount,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };

    return { success: true, result: repayment, error: null };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### 複数データの場合（重複排除とバルク取得）

複数のデータ（例: 返済一覧）に関連するユーザー情報を効率的に取得します。

```typescript
export async function getAllRepayments(): Promise<Result<Repayment[]>> {
  try {
    // 1. メインデータを取得
    const responses = await apiClient.get<RepaymentResponse[]>("/repayments");

    // 2. 重複を排除したユーザーIDリストを作成（Set）
    const userIds = new Set<string>();
    responses.forEach((repayment) => {
      userIds.add(repayment.payerId);
      userIds.add(repayment.debtorId);
    });

    // 3. 全ユーザー情報を並列取得（Promise.all）
    const users = await Promise.all(
      Array.from(userIds).map((userId) =>
        apiClient.get<User>(`/users/${userId}`),
      ),
    );

    // 4. O(1)検索用のマップを作成（Map）
    const userMap = new Map(users.map((user) => [user.id, user]));

    // 5. 各データにユーザー情報を付加
    const repayments: Repayment[] = responses.map((response) => ({
      id: response.id,
      payer: userMap.get(response.payerId)!,
      debtor: userMap.get(response.debtorId)!,
      amount: response.amount,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
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

### パフォーマンス最適化のポイント

- **`Promise.all`**: 並列リクエストでレスポンス時間を短縮
- **`Set`**: ユーザーIDの重複を自動的に排除（例: 10件の返済に登場するユーザーが5人なら5回だけリクエスト）
- **`Map`**: O(1)の検索速度で大量データでも高速

### エラーハンドリング

いずれかのユーザー取得が失敗した場合、操作全体をエラーとして扱います。これによりデータ一貫性を保ち、デバッグを容易にします。

## 型設計パターン（Response型とフロントエンド型の分離）

バックエンドAPIのレスポンス型とフロントエンドで使用する型を明確に分離するパターンです。

### 基本パターン

```typescript
// features/repayment/types.ts

import type { User } from "@/features/user/types";

// バックエンドAPIのレスポンス型（IDのみ）
export type RepaymentResponse = {
  id: string;
  payerId: string; // IDのみ
  debtorId: string; // IDのみ
  amount: number;
  createdAt: string;
  updatedAt: string;
};

// フロントエンド型（完全なユーザーオブジェクト）
export type Repayment = {
  id: string;
  payer: User; // Userオブジェクト
  debtor: User; // Userオブジェクト
  amount: number;
  createdAt: string;
  updatedAt: string;
};
```

### なぜ分離するのか

1. **Server Actionでの変換を明示**: APIレスポンス → フロントエンド型の変換がコード上で明確
2. **型安全性の向上**: `userId`のような文字列IDを誤って使用することを防ぐ
3. **UIコンポーネントの簡潔化**: コンポーネント側では常に完全なユーザーオブジェクトがあることを前提にできる

### UIコンポーネントでの利用

```typescript
// components/repayment-card.tsx

type Props = {
  repayment: Repayment;  // フロントエンド型のみを受け取る
};

export function RepaymentCard({ repayment }: Props) {
  // payer/debtorは常にUserオブジェクト（IDではない）
  const payerName = repayment.payer.name;
  const debtorAvatar = repayment.debtor.avatar;

  return (
    <div>
      {debtorAvatar && <img src={debtorAvatar} alt={payerName} />}
      <p>{payerName}</p>
    </div>
  );
}
```

### 他のエンティティでの例

```typescript
// features/group/types.ts

export type GroupResponse = {
  id: string;
  name: string;
  createdBy: string; // IDのみ
  createdAt: string;
  updatedAt: string;
};

export type Group = {
  id: string;
  name: string;
  creator: User; // Userオブジェクト
  createdAt: string;
  updatedAt: string;
};
```

```typescript
// features/credit/types.ts

export type CreditResponse = {
  userId: string; // IDのみ
  amount: number;
};

export type Credit = {
  user: User; // Userオブジェクト
  amount: number;
};
```

### 重要な注意点

- **既存の型を変更する場合**: すべての利用箇所を一度に更新する必要があります（段階的な移行は型エラーで困難）
- **バックエンドAPIは変更不要**: この変更はフロントエンド内部のみで完結します

## よくあるエラーと対処法（最重要3つ）

以下は最も頻繁に遭遇するエラーです。より詳細なトラブルシューティングは [patterns.md](patterns.md) を参照してください。

### 1. FormDataが空になる

**症状**: Server Actionでフォームデータを受け取れない

**原因**: `name` 属性の欠落（最も多いエラー）

**解決策**:

```tsx
// ❌NG
<input id={field.id} defaultValue={field.defaultValue} />

// ✅OK
<input name={field.name} id={field.id} defaultValue={field.defaultValue} />
```

### 2. HTMLセマンティックエラー

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

### 3. 1Password拡張機能の補完が邪魔

**症状**: フォーム入力時に1Passwordの候補が表示される

**解決策**: `Input` コンポーネントを使用（自動的に対応される）

```tsx
<Input type="text" name={field.name} />
// autoComplete="off" と data-1p-ignore が自動適用される
```

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

**CRITICAL**: 実装前に必ず[MDN](https://developer.mozilla.org/ja/)でHTML仕様を確認すること。

#### インタラクティブ要素のネスト禁止

```tsx
// ❌NG: <a>の中に<button>を入れてはいけない
<Link href="/groups/1">
  <Button>開く</Button>
</Link>

// ✅OK: LinkButtonコンポーネントを使う
<LinkButton href="/groups/1">開く</LinkButton>
```

**理由**: HTMLの仕様上、`<a>`要素はインタラクティブコンテンツ（`<button>`, `<a>`, `<input>`など）を含むことができません。

### 2. **`name` 属性は必須**

FormDataに含めたい全ての入力要素に `name` 属性を設定する。

```tsx
// ❌NG: name属性がない
<input id={field.id} defaultValue={field.defaultValue} />

// ✅OK: name属性を設定
<input name={field.name} id={field.id} defaultValue={field.defaultValue} />
```

**理由**: これがないとServer ActionでFormDataを受け取れず、フォームが機能しません。

### 3. **UIコンポーネントを使う**

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

## 参考資料

- [patterns.md](patterns.md) - 実装パターンの詳細
- [design-system.md](design-system.md) - デザインシステムとUIコンポーネント
- [MDN Web Docs](https://developer.mozilla.org/ja/) - HTML仕様の確認
- [Conform公式ドキュメント](https://ja.conform.guide/) - フォームライブラリの最新API（バージョンアップで変わるため常に確認）
- `frontend/src/features/group/components/group-basic-info-form.tsx` - フォーム実装の参考例
- `frontend/src/features/group/components/group-member-management.tsx` - 複雑なフォームの参考例
- `frontend/src/features/lending/components/lending-create-form.tsx` - 動的配列フォームの参考例
- `frontend/src/components/ui/` - UIコンポーネントの実装例
