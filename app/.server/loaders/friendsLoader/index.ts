import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const friendsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const status = searchParams.get("status");

  const idToken = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const { users: friends } =
    status === "requests"
      ? await dattiClient.friends.requests.$get()
      : status === "pendings"
        ? await dattiClient.friends.pendings.$get()
        : await dattiClient.friends.$get();

  return {
    friends,
  };
};

export type FriendsLoader = typeof friendsLoader;
