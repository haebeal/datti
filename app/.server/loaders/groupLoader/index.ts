import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const groupLoader = async ({
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

  const { client } = await createAPIClient({ request, context });

  const group = client.groups._groupId(groupId).$get();

  return defer({
    group,
  });
};

export type GroupLoader = typeof groupLoader;
