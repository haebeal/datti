import { LoaderFunctionArgs } from "@remix-run/cloudflare";
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

  const { events } = await dattiClient.groups._groupId(groupId).events.$get();

  if (events === null) {
    return {
      events: [] satisfies Event[],
    };
  }

  return {
    events,
  };
};

export type GroupEventsLoader = typeof groupEventsLoader;
