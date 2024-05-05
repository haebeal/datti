import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders/authLoader";
import { createDattiClient } from "~/lib/apiClient";

export const friendsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  console.log("start friends loader");
  const start = performance.now();

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const status = searchParams.get("status");

  const auth = await authLoader({
    request,
    params,
    context,
  });
  const { idToken } = await auth.json();

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

  const end = performance.now();
  console.log(`end friends loader at ${end - start}ms`);

  return {
    friends,
  };
};

export type FriendsLoader = typeof friendsLoader;
