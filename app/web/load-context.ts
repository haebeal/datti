import type { PlatformProxy } from "wrangler";

interface Env {
	SESSION_SECRET: string;
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
