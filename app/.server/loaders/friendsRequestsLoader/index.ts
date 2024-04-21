import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders/authLoader";
import { createDattiClient } from "~/lib/apiClient";

export const friendsRequestsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  console.log("start friends loader");
  const start = performance.now();

  const auth = await authLoader({
    request,
    params,
    context,
  });
  const { idToken, profile } = await auth.json();

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const { users: friends } = await dattiClient.friends.$get();
  const users = (await dattiClient.users.$get()).users.filter(
    (user) => user.uid !== profile.uid
  );

  const end = performance.now();
  console.log(`end friends loader at ${end - start}ms`);

  return {
    users,
    friends,
  };
};

export type FriendsRequestsLoader = typeof friendsRequestsLoader;
