import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteSession } from "@/libs/session/session";

/**
 * ログアウトエンドポイント
 * Redisからセッションを削除し、Cookieを削除
 */
export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  // Redisからセッションを削除
  if (sessionId) {
    await deleteSession(sessionId);
  }

  // Cookieを削除
  cookieStore.delete("session_id");

  return NextResponse.json({ success: true });
}
