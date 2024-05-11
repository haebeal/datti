import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const groupEventsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const groupId = params.id;
  if (!groupId) {
    throw new Error("Not Found Group");
  }

  const idToken = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const events = dattiClient.groups._groupId(groupId).events.$get();

  return defer({ events });
};

export type GroupEventsLoader = typeof groupEventsLoader;
