import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createSupabaseClient } from "~/lib/supabase.server";

export const loader = () => redirect("/");

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { headers, supabase } = createSupabaseClient({
    request,
    context,
  });
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo: `${context.cloudflare.env.CLIENT_URL}/api/auth/callback/google`,
    },
  });

  if (data.url) {
    return redirect(data.url, { headers }); // use the redirect API for your server framework
  }
};
