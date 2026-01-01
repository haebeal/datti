"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * ログアウト処理
 * Cookieからトークンを削除して認証ページへリダイレクト
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("firebase_token");
  redirect("/auth");
}
