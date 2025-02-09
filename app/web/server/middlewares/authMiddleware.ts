import { createMiddleware } from "hono/factory";
import type { Env } from "server";
import { createSupabase } from "server/utils/supabase";

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
	if (c.req.path !== "/signin") {
		const supabase = createSupabase(c);
		const { error: getUserError } = await supabase.auth.getUser();
		if (getUserError) {
			return c.redirect("/signin");
		}
		const {
			data: { session },
			error: getSessionError,
		} = await supabase.auth.getSession();
		const accessToken = session?.access_token;
		if (getSessionError || accessToken === undefined) {
			return c.redirect("/signin");
		}
		c.set("accessToken", accessToken);
	}
	await next();
});
