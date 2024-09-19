import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createSupabaseClient } from "~/lib/supabase.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const code = url.searchParams.get("code")?.toString();
	const next = url.searchParams.get("next") || "/";

	if (code) {
		const { headers, supabase } = createSupabaseClient({ request, context });
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			return redirect(next, {
				headers,
			});
		}
	}
};
