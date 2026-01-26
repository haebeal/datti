import "server-only";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_SESSIONS_TABLE;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7日間
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5分前にリフレッシュ
const MAX_REFRESH_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

export type Session = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  createdAt: number;
  lastAccessedAt: number;
};

type SessionItem = Session & {
  sessionId: string;
  expiresAt: number; // TTL用（Unix秒）
};

type CognitoRefreshResponse = {
  access_token: string;
  id_token: string;
  expires_in: string;
  token_type: string;
};

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
 * 新しいセッションを作成してDynamoDBに保存
 */
export async function createSession(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<string> {
  const sessionId = nanoid(32);
  const now = Date.now();
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS;

  const item: SessionItem = {
    sessionId,
    accessToken,
    refreshToken,
    accessTokenExpiresAt: now + expiresIn * 1000,
    createdAt: now,
    lastAccessedAt: now,
    expiresAt,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return sessionId;
}

/**
 * セッションを取得（スライディング有効期限で自動延長）
 * アクセストークンが失効していれば自動リフレッシュ
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { sessionId },
    }),
  );

  if (!result.Item) {
    return null;
  }

  const item = result.Item as SessionItem;
  const now = Date.now();

  // アクセストークンが失効している、または5分以内に失効する場合はリフレッシュ
  if (item.accessTokenExpiresAt - TOKEN_REFRESH_BUFFER_MS < now) {
    const refreshResult = await refreshWithRetry(item);
    if (!refreshResult.success) {
      // 永続的エラーの場合のみセッション削除
      if (refreshResult.isPermanent) {
        await deleteSession(sessionId);
      }
      return null;
    }
    item.accessToken = refreshResult.session.accessToken;
    item.refreshToken = refreshResult.session.refreshToken;
    item.accessTokenExpiresAt = refreshResult.session.accessTokenExpiresAt;
  }

  // lastAccessedAtを更新してTTL延長（スライディングセッション）
  item.lastAccessedAt = now;
  item.expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS;

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return {
    accessToken: item.accessToken,
    refreshToken: item.refreshToken,
    accessTokenExpiresAt: item.accessTokenExpiresAt,
    createdAt: item.createdAt,
    lastAccessedAt: item.lastAccessedAt,
  };
}

/**
 * セッションを削除
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { sessionId },
    }),
  );
}

/**
 * Cognito Refresh Token を使ってアクセストークンを更新
 */
async function refreshAccessToken(session: Session): Promise<RefreshResult> {
  try {
    const response = await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.COGNITO_CLIENT_ID,
        refresh_token: session.refreshToken,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to refresh token:", errorText);

      const isPermanent =
        errorText.includes("invalid_grant") ||
        errorText.includes("invalid_request");
      return { success: false, isPermanent };
    }

    const data: CognitoRefreshResponse = await response.json();

    return {
      success: true,
      session: {
        accessToken: data.access_token,
        refreshToken: session.refreshToken,
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
