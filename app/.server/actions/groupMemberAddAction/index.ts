import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders";
import { createDattiClient } from "~/lib/apiClient";

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

  const auth = await authLoader({ request, params, context });
  const { idToken } = await auth.json();

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  if (request.method === "POST") {
    console.log(uid);
    await dattiClient.groups._groupId(groupId).members.$post({
      body: {
        uids: [uid],
      },
    });
  }

  return json({});
};

export type GroupMemberAddAction = typeof groupMemberAddAction;
