import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const friendsLoader = async ({
  request,
  context,
}: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("q")?.toString();

  const { client, headers } = await createAPIClient({ request, context });

  // フレンド申請対象となるユーザー一覧を取得
  const users = client.users.$get({
    query: {
      status: "none",
      email: searchQuery,
    },
  });

  // フレンド一覧を取得
  const friends = client.users.$get({
    query: {
      status: "friend",
    },
  });

  // 申請中一覧を取得
  const requestings = client.users.$get({
    query: {
      status: "requesting",
    },
  });

  // 受理中一覧を取得
  const applyings = client.users.$get({
    query: {
      status: "applying",
    },
  });

  return defer(
    {
      users,
      friends,
      requestings,
      applyings,
    },
    { headers }
  );
};

export type FriendsLoader = typeof friendsLoader;
