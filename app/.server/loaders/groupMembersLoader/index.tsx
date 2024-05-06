import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders/authLoader";
import { createDattiClient } from "~/lib/apiClient";

export const groupMembersLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  console.log("start groupLoader");
  const start = performance.now();

  const groupId = params.id;

  if (!groupId) {
    throw new Error("Not Found Group");
  }

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

  const { users } = await dattiClient.groups._groupId(groupId).$get();

  const end = performance.now();
  console.log(`end groupLoader at ${end - start}ms`);

  return {
    members: users,
  };
};

export type GroupMembersLoader = typeof groupMembersLoader;
