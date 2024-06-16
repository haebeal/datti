import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const friendsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("q")?.toString();

  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

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

  return defer({
    users,
    friends,
    requestings,
    applyings,
  });
};

export type FriendsLoader = typeof friendsLoader;
