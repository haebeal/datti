import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import type { Env } from "server";

export function createSupabase(c: Context<Env>) {
	return createServerClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return parseCookieHeader(c.req.header("cookie") ?? "");
			},
			setAll(cookiesToSet) {
				for (const { name, value, options } of cookiesToSet) {
					setCookie(c, name, value, {
						domain: options.domain,
						expires: options.expires,
						httpOnly: options.httpOnly,
						maxAge: (() => {
							if (options.maxAge === undefined) {
								return undefined;
							}
							if (options.maxAge > 34560000) {
								return 34560000;
							}
							return options.maxAge;
						})(),
						path: options.path,
						secure: options.secure,
						sameSite: (() => {
							switch (options.sameSite) {
								case "strict":
									return "Strict";
								case "lax":
									return "Lax";
								case "none":
									return "none";
								default:
									return undefined;
							}
						})(),
						partitioned: options.partitioned,
						priority: (() => {
							switch (options.priority) {
								case "low":
									return "Low";
								case "medium":
									return "Medium";
								case "high":
									return "High";
								default:
									return undefined;
							}
						})(),
					});
				}
			},
		},
	});
}
