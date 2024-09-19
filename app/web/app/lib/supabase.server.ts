import type { AppLoadContext } from "@remix-run/cloudflare";
import {
	createServerClient,
	parseCookieHeader,
	serializeCookieHeader,
} from "@supabase/ssr";

export const createSupabaseClient = ({
	request,
	context,
}: {
	request: Request;
	context: AppLoadContext;
}) => {
	const headers = new Headers();

	const supabase = createServerClient(
		context.cloudflare.env.SUPABASE_URL,
		context.cloudflare.env.SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return parseCookieHeader(request.headers.get("Cookie") ?? "");
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						headers.append(
							"Set-Cookie",
							serializeCookieHeader(name, value, options),
						);
					}
				},
			},
		},
	);

	return { supabase, headers };
};
