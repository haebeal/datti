import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const eventLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const groupId = params.groupId;
  const eventId = params.eventId;

  if (typeof groupId !== "string" || typeof eventId !== "string") {
    throw new Error("Not Found Event");
  }

  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  const event = client.groups._groupId(groupId).events._eventId(eventId).$get();

  return defer({ event });
};

export type EventLoader = typeof eventLoader;
