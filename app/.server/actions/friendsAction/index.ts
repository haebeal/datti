import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const friendsAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const uid = formData.get("uid");

  if (typeof uid !== "string") {
    throw new Error();
  }

  const { idToken } = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  if (request.method === "POST") {
    await dattiClient.users._userId(uid).requests.$post();
  } else if (request.method === "DELETE") {
    await dattiClient.friends._userId(uid).$delete();
  }

  return json({});
};

export type FriendsAction = typeof friendsAction;
