import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const groupMemberAddAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const groupId = params.id;
  const uid = formData.get("uid");

  if (typeof groupId !== "string" || typeof uid !== "string") {
    throw new Error();
  }

  const idToken = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  if (request.method === "POST") {
    await dattiClient.groups._groupId(groupId).members.$post({
      body: {
        uids: [uid],
      },
    });
  }

  return json({});
};

export type GroupMemberAddAction = typeof groupMemberAddAction;
