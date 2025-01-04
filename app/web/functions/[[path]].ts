import handle from "hono-remix-adapter/cloudflare-pages";

import app from "server";
// ビルド未実施の場合 TS2307: Cannot find module が出る
// @ts-ignore 開発時は意識する必要ないため、無視させる
import * as build from "../build/server";

export const onRequest = handle(build, app);
