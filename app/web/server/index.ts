import { Hono } from "hono";
export type Env = {
	Bindings: Bindings;
};

type Bindings = {
	SESSION_SECRET: string;
	BACKEND_ENDPOINT: string;
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
};

const app = new Hono<Env>();

export default app;
