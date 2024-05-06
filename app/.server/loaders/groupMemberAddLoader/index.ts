import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const groupMemberAddLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const idToken = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("q");

  const profile = await dattiClient.users.me.$get();
  const { users: friends } = await dattiClient.friends.$get();
  const users = (
    await dattiClient.users.$get({
      query: {
        email: searchQuery ?? undefined,
      },
    })
  ).users.filter((user) => user.uid !== profile.uid);

  return {
    users,
    friends,
  };
};

export type GroupMemberAddLoader = typeof groupMemberAddLoader;
