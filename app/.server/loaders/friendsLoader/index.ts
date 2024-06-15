import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const friendsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("q");

  const { idToken } = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  // フレンド申請対象となるユーザー一覧を取得
  const users = dattiClient.users.$get({
    query: {
      status: "none",
      email: searchQuery ?? undefined,
    },
  });

  // フレンド一覧を取得
  const friends = dattiClient.users.$get({
    query: {
      status: "friend",
    },
  });

  // 申請中一覧を取得
  const applyings = dattiClient.users.$get({
    query: {
      status: "applying",
    },
  });

  // 受理中一覧を取得
  const pendings = dattiClient.users.$get({
    query: {
      status: "pending",
    },
  });

  return defer({
    users,
    friends,
    applyings,
    pendings,
  });
};

export type FriendsLoader = typeof friendsLoader;
