import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { authMiddleware } from "server/middlewares/authMiddleware";

export type Env = {
	Variables: Variables;
	Bindings: Bindings;
};

type Variables = {
	accessToken?: string;
};

type Bindings = {
	SESSION_SECRET: string;
	BACKEND_ENDPOINT: string;
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
};

const app = new Hono<Env>();

app.use(contextStorage());
app.use(authMiddleware);


export default app;
