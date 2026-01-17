import "server-only";

import { nanoid } from "nanoid";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SESSION_PREFIX = "session:";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7日間
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5分前にリフレッシュ
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const MAX_REFRESH_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

// リフレッシュ失敗時にセッション削除すべき永続的エラー
const PERMANENT_ERROR_CODES = [
  "INVALID_REFRESH_TOKEN",
  "TOKEN_EXPIRED",
  "USER_DISABLED",
  "USER_NOT_FOUND",
];

export interface Session {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  createdAt: number;
  lastAccessedAt: number;
}

interface FirebaseRefreshResponse {
  access_token: string;
  expires_in: string;
  token_type: string;
  refresh_token: string;
  id_token: string;
  user_id: string;
  project_id: string;
}

type RefreshResult =
  | {
      success: true;
      session: Pick<
        Session,
        "accessToken" | "refreshToken" | "accessTokenExpiresAt"
      >;
    }
  | { success: false; isPermanent: boolean };

/**
 * 新しいセッションを作成してRedisに保存
 */
export async function createSession(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<string> {
  const sessionId = nanoid(32);
  const now = Date.now();

  const session: Session = {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: now + expiresIn * 1000,
    createdAt: now,
    lastAccessedAt: now,
  };

  await redis.set(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(session), {
    ex: SESSION_TTL_SECONDS,
  });

  return sessionId;
}

/**
 * セッションを取得（スライディング有効期限で自動延長）
 * アクセストークンが失効していれば自動リフレッシュ
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  const data = await redis.get<string>(`${SESSION_PREFIX}${sessionId}`);
  if (!data) {
    return null;
  }

  const session: Session = typeof data === "string" ? JSON.parse(data) : data;
  const now = Date.now();

  // アクセストークンが失効している、または5分以内に失効する場合はリフレッシュ
  if (session.accessTokenExpiresAt - TOKEN_REFRESH_BUFFER_MS < now) {
    const result = await refreshWithRetry(session);
    if (!result.success) {
      // 永続的エラーの場合のみセッション削除
      if (result.isPermanent) {
        await deleteSession(sessionId);
      }
      return null;
    }
    session.accessToken = result.session.accessToken;
    session.refreshToken = result.session.refreshToken;
    session.accessTokenExpiresAt = result.session.accessTokenExpiresAt;
  }

  // lastAccessedAtを更新してTTL延長（スライディングセッション）
  session.lastAccessedAt = now;
  await redis.set(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(session), {
    ex: SESSION_TTL_SECONDS,
  });

  return session;
}

/**
 * セッションを削除
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`${SESSION_PREFIX}${sessionId}`);
}

/**
 * Firebase Refresh Token を使ってアクセストークンを更新
 */
async function refreshAccessToken(session: Session): Promise<RefreshResult> {
  try {
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: session.refreshToken,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to refresh token:", errorText);

      const isPermanent = PERMANENT_ERROR_CODES.some((code) =>
        errorText.includes(code),
      );
      return { success: false, isPermanent };
    }

    const data: FirebaseRefreshResponse = await response.json();

    return {
      success: true,
      session: {
        accessToken: data.id_token,
        refreshToken: data.refresh_token,
        accessTokenExpiresAt:
          Date.now() + Number.parseInt(data.expires_in, 10) * 1000,
      },
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return { success: false, isPermanent: false };
  }
}

/**
 * リトライ付きでアクセストークンをリフレッシュ
 */
async function refreshWithRetry(session: Session): Promise<RefreshResult> {
  for (let attempt = 0; attempt < MAX_REFRESH_RETRIES; attempt++) {
    const result = await refreshAccessToken(session);

    if (result.success) {
      return result;
    }

    if (result.isPermanent) {
      return result;
    }

    if (attempt < MAX_REFRESH_RETRIES - 1) {
      const delay = INITIAL_RETRY_DELAY_MS * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { success: false, isPermanent: false };
}
