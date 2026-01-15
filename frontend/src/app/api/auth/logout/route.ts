import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SESSION_PREFIX = "session:";

/**
 * ログアウトエンドポイント
 * Redisからセッションを削除し、Cookieを削除
 */
export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId) {
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
  }

  cookieStore.delete("session_id");

  return NextResponse.json({ success: true });
}
