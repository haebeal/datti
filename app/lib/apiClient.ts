import fetchClient from "@aspida/fetch";
import { AppLoadContext, redirect } from "@remix-run/cloudflare";
import api from "~/api/$api";
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

  const client = api(
    fetchClient(undefined, {
      baseURL: context.cloudflare.env.BACKEND_ENDPOINT,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
  );
  return { client, headers };
};
