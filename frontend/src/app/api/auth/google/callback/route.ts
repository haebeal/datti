import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSession } from "@/libs/session/session";

const API_BASE_URL = process.env.API_URL;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL;

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface FirebaseSignInResponse {
  idToken: string;
  email: string;
  displayName: string;
  photoUrl: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

/**
 * Google OAuth コールバックエンドポイント
 * ログイン試行 → 失敗したら自動登録
 */
export async function GET(request: NextRequest) {
  // cookies() はリクエストスコープ内で最初に呼び出す必要がある
  const cookieStore = await cookies();

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL(`/auth?error=auth_failed`, APP_URL));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=no_token", APP_URL));
  }

  try {
    // 1. GoogleのトークンエンドポイントでIDトークンを取得
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Google token exchange failed:", errorText);
      return NextResponse.redirect(new URL("/auth?error=auth_failed", APP_URL));
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    const googleIdToken = tokenData.id_token;

    // 2. Firebase Auth REST APIでGoogleトークンをFirebaseトークンに変換
    const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`;

    const firebaseResponse = await fetch(firebaseAuthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postBody: `id_token=${googleIdToken}&providerId=google.com`,
        requestUri: `${APP_URL}/api/auth/google/callback`,
        returnSecureToken: true,
      }),
      cache: "no-store",
    });

    if (!firebaseResponse.ok) {
      const errorText = await firebaseResponse.text();
      console.error("Firebase signInWithIdp failed:", errorText);
      return NextResponse.redirect(new URL("/auth?error=auth_failed", APP_URL));
    }

    const firebaseData: FirebaseSignInResponse = await firebaseResponse.json();
    const firebaseIdToken = firebaseData.idToken;

    // 3. バックエンドAPIでログイン試行
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${firebaseIdToken}`,
      },
      cache: "no-store",
    });

    if (loginResponse.status === 200) {
      // ユーザーが既に存在: セッション作成してダッシュボードへ
      const sessionId = await createSession(
        firebaseIdToken,
        firebaseData.refreshToken,
        Number.parseInt(firebaseData.expiresIn, 10),
      );

      cookieStore.set("session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7日間
        path: "/",
      });

      return NextResponse.redirect(new URL("/", APP_URL));
    }

    if (loginResponse.status === 401) {
      // ユーザーが存在しない: 自動的にサインアップ
      const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firebaseIdToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: firebaseData.displayName,
          email: firebaseData.email,
          avatar: firebaseData.photoUrl,
        }),
        cache: "no-store",
      });

      if (signupResponse.status === 201) {
        // サインアップ成功: セッション作成してダッシュボードへ
        const sessionId = await createSession(
          firebaseIdToken,
          firebaseData.refreshToken,
          Number.parseInt(firebaseData.expiresIn, 10),
        );

        cookieStore.set("session_id", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7日間
          path: "/",
        });

        return NextResponse.redirect(new URL("/", APP_URL));
      }

      // サインアップ失敗
      const errorData = await signupResponse.text();
      console.error("Signup failed:", signupResponse.status, errorData);
      return NextResponse.redirect(
        new URL("/auth?error=signup_failed", APP_URL),
      );
    }

    // その他のエラー
    const errorData = await loginResponse.text();
    console.error("Backend auth failed:", loginResponse.status, errorData);
    return NextResponse.redirect(new URL("/auth?error=auth_failed", APP_URL));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/auth?error=server_error", APP_URL));
  }
}
