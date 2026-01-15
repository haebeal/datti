"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/libs/session/session";

/**
 * セッションからアクセストークンを取得
 * セッションが存在しない、または無効な場合は/authにリダイレクト
 * アクセストークンが失効していれば自動リフレッシュされる
 */
export async function getAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) {
    redirect("/auth");
  }

  const session = await getSession(sessionId);
  if (!session) {
    redirect("/auth");
  }

  return session.accessToken;
}
