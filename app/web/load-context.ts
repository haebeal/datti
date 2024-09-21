import { type PlatformProxy } from "wrangler";

interface Env {
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FIREBASE_API_KEY: string;
  FIREBASE_TENANT_ID: string;
  BACKEND_ENDPOINT: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}
