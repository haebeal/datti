import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/libs/session/session";

const API_BASE_URL = process.env.API_URL;

type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

/**
 * セッションからアクセストークンを取得
 * セッションが存在しない、または無効な場合は/authにリダイレクト
 * アクセストークンが失効していれば自動リフレッシュされる
 */
async function getAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) {
    redirect("/auth");
  }

  const session = await getSession(sessionId);
  if (!session) {
    redirect("/auth");
  }

  return session.accessToken;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions,
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  // レスポンスが空の場合はnullを返す
  const text = await response.text();
  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

export const apiClient = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, { method: "POST", body }),

  put: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, { method: "PUT", body }),

  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "DELETE" }),
};
