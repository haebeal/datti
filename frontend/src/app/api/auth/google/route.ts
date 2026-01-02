import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

/**
 * Google OAuth認証開始エンドポイント
 * ログインまたはサインアップ（自動判定）
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!clientId) {
    console.error("GOOGLE_CLIENT_ID is not set");
    return redirect("/auth?error=server_error");
  }

  // state パラメータにtimestampを含める（CSRF対策）
  const state = JSON.stringify({ timestamp: Date.now() });
  const encodedState = Buffer.from(state).toString("base64url");

  // Google OAuth 2.0 認証URLを構築
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", encodedState);
  googleAuthUrl.searchParams.set("access_type", "online");
  googleAuthUrl.searchParams.set("prompt", "select_account");

  // Googleの認証ページにリダイレクト
  return redirect(googleAuthUrl.toString());
}
