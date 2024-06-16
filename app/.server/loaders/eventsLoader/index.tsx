import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const eventsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const groupId = params.groupId;
  if (groupId === undefined) {
    throw new Response("グループIDの取得に失敗しました", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  const events = client.groups._groupId(groupId).events.$get();
  const members = client.groups._groupId(groupId).members.$get();

  return defer({ members, events });
};

export type EventsLoader = typeof eventsLoader;
