const API_BASE_URL = process.env.API_URL;

type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

async function fetchApi<T>(
  endpoint: string,
  token: string,
  options: RequestOptions,
): Promise<T> {
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
  get: <T>(endpoint: string, token: string) =>
    fetchApi<T>(endpoint, token, { method: "GET" }),

  post: <T>(endpoint: string, token: string, body: unknown) =>
    fetchApi<T>(endpoint, token, { method: "POST", body }),

  put: <T>(endpoint: string, token: string, body: unknown) =>
    fetchApi<T>(endpoint, token, { method: "PUT", body }),

  delete: <T>(endpoint: string, token: string) =>
    fetchApi<T>(endpoint, token, { method: "DELETE" }),
};
