import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const groupMembersAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const groupId = params.groupId;
  const uid = formData.get("uid");

  if (typeof groupId !== "string" || typeof uid !== "string") {
    throw new Error();
  }

  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  if (request.method === "POST") {
    await client.groups._groupId(groupId).members.$post({
      body: {
        uids: [uid],
      },
    });
  }

  return json({});
};

export type GroupMembersAction = typeof groupMembersAction;
