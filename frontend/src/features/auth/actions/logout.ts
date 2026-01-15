"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { deleteSession } from "@/libs/session/session";

/**
 * ログアウト処理
 * Redisからセッションを削除し、Cookieを削除して認証ページへリダイレクト
 */
export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  cookieStore.delete("session_id");
  redirect("/auth");
}
