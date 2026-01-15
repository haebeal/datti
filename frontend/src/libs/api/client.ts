import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

const API_BASE_URL = process.env.API_URL;

export function createApiClient(token: string) {
  const authMiddleware: Middleware = {
    async onRequest({ request }) {
      request.headers.set("Authorization", `Bearer ${token}`);
      return request;
    },
  };

  const client = createClient<paths>({
    baseUrl: API_BASE_URL,
    cache: "no-store",
  });

  client.use(authMiddleware);

  return client;
}
