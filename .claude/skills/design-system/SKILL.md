---
name: design-system
description: Dattiデザインシステム。間隔、UIコンポーネント仕様、スタイリング原則を定義。Web・モバイル共通で参照。
---

# Datti Design System

このスキルは、Dattiのデザインシステムを定義します。Web（Next.js）およびモバイル開発で共通して参照してください。

## カラーパレット

**定義ファイル**: `frontend/src/app/globals.css`

### カラー一覧

| カテゴリ | トークン | HEX | 用途 |
|----------|----------|-----|------|
| **Primary** | `primary-hover` | `#334155` | ホバー時 |
| | `primary-base` | `#1E293B` | テキスト、ボタン、アイコン |
| | `primary-active` | `#0F172A` | アクティブ/押下時 |
| | `primary-surface` | `#E6F4F1` | 選択状態の背景 |
| **Accent** | `accent-hover` | `#2A9D96` | ホバー時 |
| | `accent-base` | `#1C857E` | アクセントカラー |
| | `accent-active` | `#166D67` | アクティブ/押下時 |
| **Success** | `success-hover` | `#10B981` | ホバー時 |
| | `success-base` | `#059669` | プラス金額、成功メッセージ |
| | `success-active` | `#047857` | アクティブ/押下時 |
| **Error** | `error-hover` | `#EF4444` | ホバー時 |
| | `error-base` | `#DC2626` | マイナス金額、エラーメッセージ |
| | `error-active` | `#B91C1C` | アクティブ/押下時 |

### 使用例

```tsx
// テキストカラー
<p className="text-primary-base">メインテキスト</p>
<p className="text-success-base">+¥10,000</p>
<p className="text-error-base">-¥5,000</p>

// 背景カラー（選択状態）
<div className="bg-primary-surface">選択中のアイテム</div>

// ボタン
<Button className="bg-primary-base hover:bg-primary-hover">
```

### セマンティックカラーの使い分け

| 状況 | カラー | 例 |
|------|--------|-----|
| 回収予定（+金額） | `text-success-base` | +¥47,937 |
| 支払い予定（-金額） | `text-error-base` | -¥11,320 |
| 成功メッセージ | `text-success-base` | 保存しました |
| エラーメッセージ | `text-error-base` | 入力エラー |
| 選択状態の背景 | `bg-primary-surface` | メニュー、リスト |

### アバターのデフォルト背景

ユーザーアバターが未設定の場合のグラデーション：

```tsx
<div className="bg-gradient-to-br from-primary-base to-primary-active">
  {userName.charAt(0)}
</div>
```

### 注意事項

- **ハードコードの色は使わない**: `text-red-500` ではなく `text-error-base` を使用
- **一貫性**: 同じ意味を持つ色は同じトークンを使用
- **アクセシビリティ**: 色だけでなく、記号（+/-）も併用して情報を伝える

## 間隔（Spacing）

プロジェクト全体で一貫した間隔を使用すること。

### 間隔早見表

| 用途 | クラス | サイズ | 備考 |
|------|--------|--------|------|
| フォームコンテナのパディング | `p-6` | 24px | フォーム全体の内側余白 |
| フォーム要素の縦間隔 | `gap-3` | 12px | ラベル、入力、エラーテキスト間 |
| 横並び要素の間隔 | `gap-5` | 20px | 入力フィールドとボタン、配列要素内 |
| リストアイテムの縦間隔 | `gap-3` | 12px | 配列の各アイテム間 |
| ページセクション間 | `gap-5` | 20px | ページ内の大きなセクション間 |
| カードのパディング（リスト） | `p-4` | 16px | 情報密度が低い場合 |
| カードのパディング（詳細） | `p-6` | 24px | 情報密度が高い場合 |

### フォームの基本構造

```tsx
<form className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
  {/* フォーム内容 */}
</form>
```

### 横並び要素

```tsx
<div className={cn("flex gap-5")}>
  <Input className={cn("flex-1")} />
  <Button>検索</Button>
</div>
```

### ページレイアウト

```tsx
<div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
  <h1>ページタイトル</h1>
  {/* コンテンツ */}
</div>
```

- **最大幅**: `w-4xl` （896px）
- **中央揃え**: `mx-auto`

## UIコンポーネント

### Input

全ての入力フィールドは `Input` コンポーネントを使用すること。

**パス**: `frontend/src/components/ui/input/input.tsx`

```tsx
import { Input } from "@/components/ui/input";

<Input
  type="text"
  name={field.name}
  id={field.id}
  defaultValue={field.initialValue}
  placeholder="例: グループ名"
/>
```

**デザイン仕様**:
```tsx
className={cn(
  "px-3 py-2",
  "border rounded-md",
  "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
  "disabled:opacity-50 disabled:cursor-not-allowed",
)}
```

**デフォルト設定**:
- `autoComplete="off"` - ブラウザの自動補完を無効化
- `data-1p-ignore` - 1Password拡張機能の補完を無効化

### DatePicker

日付入力には `DatePicker` コンポーネントを使用すること。

**パス**: `frontend/src/components/ui/date-picker/date-picker.tsx`

```tsx
import { DatePicker } from "@/components/ui/date-picker";

<DatePicker
  name={field.name}
  id={field.id}
  key={field.key}
  defaultValue={field.initialValue}
  placeholder="日付を選択"
  isError={!!field.errors}
/>
```

**特徴**:
- React Aria Components ベース
- カレンダーUIで直感的な選択
- Inputコンポーネントと統一されたデザイン
- 内部でhidden inputを使用してFormDataに対応

### Select

選択肢入力には `Select` コンポーネントを使用すること。ネイティブの `<select>` 要素は使用しない。

**パス**: `frontend/src/components/ui/select/select.tsx`

```tsx
import { Select } from "@/components/ui/select";

<Select<GroupMember>
  name={field.name}
  id={field.id}
  key={field.key}
  defaultValue={field.initialValue}
  placeholder="選択してください"
  options={members}
  getOptionLabel={(member) => member.name}
  getOptionValue={(member) => member.id}
  isError={!!field.errors}
/>
```

**特徴**:
- React Aria Components ベース
- ネイティブselect要素より優れたUX
- ジェネリック型でタイプセーフ

**デザイン仕様** (ドロップダウン):
```tsx
// ListBoxItem
className={cn(
  "px-4 py-2",
  "cursor-pointer outline-none rounded-md",
  "transition-colors duration-150",
  "data-[hovered]:bg-gray-100",
  "data-[selected]:bg-primary-base data-[selected]:text-white",
)}
```

### Button

**パス**: `frontend/src/components/ui/button/button.tsx`

```tsx
import { Button } from "@/components/ui/button";

<Button type="submit" isDisabled={isPending}>
  {isPending ? "送信中..." : "送信"}
</Button>

// カラーバリエーション
<Button color="primary" colorStyle="fill">Primary</Button>
<Button color="gray" colorStyle="outline">Gray Outline</Button>
```

**disabled状態のスタイル**:
- `disabled:opacity-50` - 透明度を下げる
- `disabled:cursor-not-allowed` - カーソルを禁止マークに
- `disabled:hover:bg-[元の色]` - ホバー時も色が変わらない

**注意**: disabled でもホバー時に色が変わる問題を防ぐには、`disabled:hover:bg-[元の色]` を明示的に指定：

```tsx
className={cn(
  "bg-primary-base",
  "hover:bg-primary-hover",
  "disabled:hover:bg-primary-base",  // 元の色に戻す
  "disabled:opacity-50",
)}
```

### LinkButton

ナビゲーション用のボタンスタイルリンク。

**パス**: `frontend/src/components/ui/link-button/link-button.tsx`

```tsx
import { LinkButton } from "@/components/ui/link-button";

<LinkButton href="/groups/1" color="primary" colorStyle="fill">
  開く
</LinkButton>
```

**使い分け**:
- `Button`: フォーム送信、モーダル操作など
- `LinkButton`: ページ遷移、ナビゲーション

### ErrorText

エラーメッセージ表示用コンポーネント。

**パス**: `frontend/src/components/ui/error-text/error-text.tsx`

```tsx
import { ErrorText } from "@/components/ui/error-text";

{field.errors && <ErrorText>{field.errors}</ErrorText>}
```

## スタイリング原則

### 入力コンポーネントの統一

全ての入力コンポーネント（Input, DatePicker, Select）は以下のスタイルで統一：

```tsx
className={cn(
  "px-3 py-2",
  "border rounded-md",
  "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
)}
```

**統一ポイント**:
- パディング: `px-3 py-2`
- ボーダー半径: `rounded-md`
- フォーカスリング: `ring-2`, `ring-offset-4`, `ring-primary-base`

### カードデザイン

```tsx
// リストビュー（情報密度: 低）
<div className={cn("p-4", "border rounded-lg")}>

// 詳細ビュー（情報密度: 高）
<div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
```

### cn() ユーティリティ

Tailwindクラスは `cn()` ユーティリティでグループ化：

```tsx
import { cn } from "@/utils/cn";

<div className={cn(
  "px-3 py-2",
  "border rounded-md",
  isError && "border-red-500",
  isDisabled && "opacity-50"
)} />
```

**メリット**:
- 可読性の向上
- クラスの競合解決
- 条件付きクラスの管理

### ホバーとフォーカス

React Aria Componentsを使用する場合は、CSS擬似クラスではなくデータ属性を使用：

```tsx
// ❌ NG: CSS擬似クラスを使用
className={cn("hover:bg-gray-100")}

// ✅ OK: React Ariaのデータ属性を使用
className={cn("data-[hovered]:bg-gray-100")}
```

**理由**: React Aria Componentsは内部でホバー状態を管理しており、`data-[hovered]` 属性を使用することで正確な状態反映が可能。

### トランジション

ホバー時の色変化にはトランジションを追加：

```tsx
className={cn(
  "transition-colors duration-150",
  "data-[hovered]:bg-gray-100",
)}
```

## デザイン反復の原則

### デザインは一度で完璧にならない

UIの実装は反復的なプロセスです。最初の実装が完璧なことはほぼありません。

**反復の例**:
```tsx
// 1回目: ring-2 ring-primary-base
// → 問題: 白文字と同化して見えない

// 2回目: ring-2 ring-white
// → 問題: まだコントラストが足りない

// 3回目: hover:bg-transparent hover:text-primary-base hover:ring-primary-base
// → 成功: アウトライン風の効果で視認性が高い
```

### フィードバックを素早く取り入れる

1. **小さく実装**: 完璧を目指さず、まず動くものを作る
2. **ユーザーフィードバック**: 実際に見てもらって意見を聞く
3. **迅速な修正**: フィードバックを受けてすぐに改善
4. **再度確認**: 修正が正しいか確認

### 視覚的バランスの重要性

機能的に問題なくても、視覚的な一貫性が欠けているとユーザーは違和感を感じます。

**例**: サイドバーのセクションヘッダー
- グループセクションにはヘッダーがあるのに、上部ナビゲーションにはない
- 機能的には問題ないが、視覚的にアンバランス
- 「マイページ」セクションヘッダーを追加することで統一感が生まれる
