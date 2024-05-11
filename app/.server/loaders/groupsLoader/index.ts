import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const groupsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const idToken = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const groups = dattiClient.groups.$get();

  return defer({
    groups,
  });
};

export type GroupsLoader = typeof groupsLoader;
