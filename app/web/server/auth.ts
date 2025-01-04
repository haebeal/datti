import { Hono } from "hono";
import type { Env } from "server";
import { createSupabase } from "server/utils/supabase";

const auth = new Hono<Env>();

auth.post("/signin", async (c) => {
	const supabase = createSupabase(c);
	const { origin } = new URL(c.req.url);
	const { data } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			queryParams: {
				access_type: "offline",
				prompt: "consent",
			},
			redirectTo: `${origin}/auth/callback/google`,
		},
	});
	if (data.url) {
		return c.redirect(data.url);
	}
});

auth.post("/signout", async (c) => {
	const supabase = createSupabase(c);
	await supabase.auth.signOut();

	return c.redirect("/signin");
});

auth.get("/callback/google", async (c) => {
	const code = c.req.query("code");

	if (code) {
		const supabase = createSupabase(c);
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			const next = c.req.query("next") ?? "/";
			return c.redirect(next);
		}
	}
});

export default auth;
