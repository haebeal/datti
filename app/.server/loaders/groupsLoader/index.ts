import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders/authLoader";
import { createDattiClient } from "~/lib/apiClient";

export const groupsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  console.log("start groupsLoader");
  const start = performance.now();

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

  const { groups: groups } = await dattiClient.groups.$get();

  const end = performance.now();
  console.log(`end groupsLoader at ${end - start}ms`);

  return {
    groups,
  };
};

export type GroupsLoader = typeof groupsLoader;
