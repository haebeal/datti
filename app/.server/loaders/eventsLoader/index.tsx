import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

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

  const { client, headers } = await createAPIClient({ request, context });

  const events = client.groups._groupId(groupId).events.$get();
  const members = client.groups._groupId(groupId).members.$get();

  return defer(
    { members, events },
    {
      headers,
    }
  );
};

export type EventsLoader = typeof eventsLoader;
