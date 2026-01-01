import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 認証不要なパス
 */
const PUBLIC_PATHS = ["/auth"];

/**
 * Proxy: 認証ガード
 * cookieにfirebase_tokenが存在しない場合は/authにリダイレクト
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 認証不要なパスはスキップ
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // cookieからIDトークンを取得
  const token = request.cookies.get("firebase_token")?.value;

  // トークンが存在しない場合は/authにリダイレクト
  if (!token) {
    const authUrl = new URL("/auth", request.url);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

/**
 * Proxyを適用するパス
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
