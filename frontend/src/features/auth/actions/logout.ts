"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { redis } from "@/libs/session/redis";

const SESSION_PREFIX = "session:";

/**
 * ログアウト処理
 * Redisからセッションを削除し、Cookieを削除して認証ページへリダイレクト
 */
export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId) {
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
  }

  cookieStore.delete("session_id");
  redirect("/auth");
}
