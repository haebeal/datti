import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const groupEventLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const groupId = params.groupId;
  const eventId = params.eventId;

  if (typeof groupId !== "string" || typeof eventId !== "string") {
    throw new Error("Not Found Event");
  }

  const idToken = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const event = dattiClient.groups
    ._groupId(groupId)
    .events._eventId(eventId)
    .$get();

  return defer({ event });
};

export type GroupEventLoader = typeof groupEventLoader;
