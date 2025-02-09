import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { Env } from "server";
import { createSupabase } from "server/utils/supabase";

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
	if (c.req.path !== "/signin") {
		const supabase = createSupabase(c);
		await supabase.auth.getUser();
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();
		const accessToken = session?.access_token;
		if (error) {
			throw new HTTPException(500, {
				message: "failed to get accessToken",
			});
		}
		c.set("accessToken", accessToken);
	}
	await next();
});
