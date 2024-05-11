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

  const idToken = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const users = dattiClient.users.$get({
    query: {
      email: searchQuery ?? undefined,
    },
  });
  const friends = dattiClient.friends.$get();
  const pendings = dattiClient.friends.pendings.$get();
  const requests = dattiClient.friends.requests.$get();

  return defer({
    users,
    friends,
    pendings,
    requests,
  });
};

export type FriendsLoader = typeof friendsLoader;
