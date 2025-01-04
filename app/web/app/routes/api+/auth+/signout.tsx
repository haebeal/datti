import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createSupabaseClient } from "~/lib/supabase.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const { headers, supabase } = createSupabaseClient({
		request,
		context,
	});
	await supabase.auth.signOut();

	return redirect("/signin", {
		headers,
	});
};
