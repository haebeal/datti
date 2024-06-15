import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const groupsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  const groups = client.groups.$get();

  return defer({
    groups,
  });
};

export type GroupsLoader = typeof groupsLoader;
