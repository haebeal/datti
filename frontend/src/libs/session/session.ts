import { nanoid } from "nanoid";
import { redis } from "./redis";

const SESSION_PREFIX = "session:";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7日間
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

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

/**
 * 新しいセッションを作成してRedisに保存
 */
export async function createSession(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
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
export async function getSession(
  sessionId: string
): Promise<Session | null> {
  const data = await redis.get<string>(`${SESSION_PREFIX}${sessionId}`);
  if (!data) {
    return null;
  }

  const session: Session = typeof data === "string" ? JSON.parse(data) : data;
  const now = Date.now();

  // アクセストークンが失効していればリフレッシュ
  if (session.accessTokenExpiresAt < now) {
    const refreshedSession = await refreshAccessToken(session);
    if (!refreshedSession) {
      // リフレッシュ失敗: セッション削除
      await deleteSession(sessionId);
      return null;
    }
    session.accessToken = refreshedSession.accessToken;
    session.refreshToken = refreshedSession.refreshToken;
    session.accessTokenExpiresAt = refreshedSession.accessTokenExpiresAt;
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
async function refreshAccessToken(
  session: Session
): Promise<Pick<Session, "accessToken" | "refreshToken" | "accessTokenExpiresAt"> | null> {
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
      }
    );

    if (!response.ok) {
      console.error("Failed to refresh token:", await response.text());
      return null;
    }

    const data: FirebaseRefreshResponse = await response.json();

    return {
      accessToken: data.id_token,
      refreshToken: data.refresh_token,
      accessTokenExpiresAt: Date.now() + Number.parseInt(data.expires_in) * 1000,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}
