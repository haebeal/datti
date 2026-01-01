import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * ログアウトエンドポイント
 * Cookieからトークンを削除
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("firebase_token");

  return NextResponse.json({ success: true });
}
