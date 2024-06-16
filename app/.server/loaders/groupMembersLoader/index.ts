import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const groupMembersLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("q")?.toString();

  const groupId = params.groupId;
  if (!groupId) {
    throw new Error("Not Found Group");
  }

  const { idToken } = await getIdToken({
    request,
    params,
    context,
  });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  const users = client.users.$get({
    query: {
      email: searchQuery ?? undefined,
    },
  });
  const members = client.groups._groupId(groupId).members.$get();

  return defer({ users, members });
};

export type GroupMembersLoader = typeof groupMembersLoader;
