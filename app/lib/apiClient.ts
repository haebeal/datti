import fetchClient from "@aspida/fetch";
import { AppLoadContext, redirect } from "@remix-run/cloudflare";
import api from "~/api/$api";
import { signInFirebaseWithGoogle } from "~/lib/firebase.server";
import { createSupabaseClient } from "~/lib/supabase.server";

export const createAPIClient = async ({
  request,
  context,
}: {
  request: Request;
  context: AppLoadContext;
}) => {
  const { headers, supabase } = createSupabaseClient({
    request,
    context,
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.provider_token) {
    throw redirect("/signin");
  }

  const { idToken } = await signInFirebaseWithGoogle(
    context.cloudflare.env.CLIENT_URL,
    context.cloudflare.env.FIREBASE_TENANT_ID,
    context.cloudflare.env.FIREBASE_API_KEY,
    session.provider_token
  );

  const client = api(
    fetchClient(undefined, {
      baseURL: context.cloudflare.env.BACKEND_ENDPOINT,
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
  );
  return { client, headers };
};
