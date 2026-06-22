# プロジェクト構成

モノレポ。`backend/`（Go API）と `frontend/`（React SPA）が並列に存在し、`backend/openapi.yaml` を両者の契約とする。

## 組織哲学

- **バックエンド: クリーンアーキテクチャ（レイヤード）**。依存方向は内向き一方向（presentation / gateway → usecase → domain）。domain は他層に依存しない。
- **フロントエンド: フィーチャー指向 + file-based ルーティング**。ドメインごとに状態・ロジックを `features/{domain}/` に co-locate し、ルートは TanStack Router の規約でファイル配置から導く。

## ディレクトリパターン

### バックエンド層（`backend/internal/`）
- **`domain/`**: 純粋なドメインモデル・値オブジェクト・リポジトリ**インターフェース**。例: `domain/user.go` の `User` 型と `NewUser()` ファクトリ。他層へ依存しない。
- **`usecase/`**: 業務ロジックとオーケストレーション。`XxxUseCaseImpl` + `NewXxxUseCase()` で domain のリポジトリインターフェースを注入。
- **`gateway/`**: インフラ実装。`gateway/repository/` が domain インターフェースを実装、`gateway/postgres/` に sqlc 生成コード、ほか R2/S3・LINE 連携など。
- **`presentation/api/`**: Echo ハンドラが生成済み ServerInterface を実装。Cognito ミドルウェアから uid を取り出し、usecase を呼んで domain → OpenAPI レスポンス型へ変換。

### フロントエンド領域（`frontend/src/`）
- **`routes/`**: TanStack Router の file-based ルート。`_authenticated.tsx` が認証ガード付きの pathless レイアウト、`$param` で動的セグメント。
- **`features/{domain}/`**: ドメイン単位の co-location。`credit / group / lending / repayment / user`。各 feature に必要なだけ `types.ts` / `queries.ts` / `schema.ts` / `mutations.ts` / `components/` を置く（小さい feature は `queries.ts` + `types.ts` のみ）。
- **`components/`**: 横断的な共有コンポーネント（`header.tsx`, `sidebar.tsx` など）と、shadcn プリミティブを置くフラットな `components/ui/`。
- **`libs/`**: アプリ統合。`libs/api/`（openapi-fetch クライアント + 生成型 `schema.d.ts`）、`libs/auth/`（Cognito の `userManager` シングルトン）。
- **`lib/utils.ts`**: shadcn 規約の `cn()` ヘルパー（`@/lib/utils`）。`libs/`（統合）と `lib/`（汎用 util）は別物なので混同しない。

## 命名規則

- **Go ファイル**: 小文字単語（`user.go`, `group.go`）。型・インターフェースは PascalCase（`Group`, `GroupRepository`, `GroupUseCaseImpl`）、ファクトリは `NewXxx`。
- **フロントのファイル**: kebab-case（`mobile-menu.tsx`, `form-field.tsx`）。React コンポーネント識別子は PascalCase。
- **ルートファイル**: TanStack 規約の kebab-case、`_name` は pathless レイアウト。
- **feature ディレクトリ**: 小文字のドメイン名（`features/group`）。
- **Query/Mutation エクスポート**: camelCase 関数 + キャッシュキー（例: `xxxQueryOptions`, `useCreateXxx()`）。

## インポートとパスエイリアス

- **Go**: エイリアスなし。`github.com/.../internal/{layer}/{module}` のフルパス import。層構成自体が整理の原則。
- **フロント**: `@/*` → `./src/*`（`tsconfig.app.json`）。絶対 import を優先。
  ```tsx
  import { Button } from "@/components/ui/button";
  import { apiClient } from "@/libs/api/client";
  ```

## コード組織の原則

- **依存方向を守る（バック）**: domain は何にも依存しない / usecase は domain インターフェースに依存 / gateway は domain を実装 / presentation は usecase と生成型に依存。逆方向・循環依存を作らない。
- **データ取得は loader 起点（フロント）**: ルートの loader で `queryClient.ensureQueryData(queryOptions(...))`、コンポーネントは `useSuspenseQuery`。認証は `beforeLoad`、ローディング UI は pending component で表現し、`useState` 起点のローディングは避ける。
- **生成コードは手編集しない**: 同一パッケージ内に生成物を置く（sqlc → `gateway/postgres/query.sql.go`、oapi-codegen → `presentation/api/*.gen.go`、mockgen → `*/test/*.gen.go`、フロント → `libs/api/schema.d.ts`・`routeTree.gen.ts`）。再生成は各 `task ...:gen` / `pnpm gen:api` で行う。

---
_ファイルツリーではなくパターンを記述。パターンに従う新規ファイルは更新を要さない_
