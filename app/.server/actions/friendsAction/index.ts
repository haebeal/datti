import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
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
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  if (request.method === "POST") {
    await client.users._userId(uid).requests.$post();
  } else if (request.method === "DELETE") {
    await client.users.friends._userId(uid).$delete();
  }

  return json({});
};

export type FriendsAction = typeof friendsAction;
