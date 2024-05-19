import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const groupLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const groupId = params.groupId;
  if (!groupId) {
    throw new Error("Not Found Group");
  }

  const { idToken } = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const group = dattiClient.groups._groupId(groupId).$get();

  return defer({
    group,
  });
};

export type GroupLoader = typeof groupLoader;
