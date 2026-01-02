# Stage 1: 依存関係のインストール
FROM node:22-alpine AS deps
RUN corepack enable pnpm
WORKDIR /app

# 依存関係定義ファイルをコピー
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 依存関係をインストール
RUN pnpm install --frozen-lockfile


# Stage 2: アプリケーションのビルド
FROM node:22-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app

# deps ステージから node_modules をコピー
COPY --from=deps /app/node_modules ./node_modules

# ソースコードをコピー
COPY . .

# Next.js をビルド (standalone 出力)
RUN pnpm run build


# Stage 3: 本番環境での実行
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# standalone 出力をコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
