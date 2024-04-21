import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders";
import { createDattiClient } from "~/lib/apiClient";

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

  const auth = await authLoader({ request, params, context });
  const { idToken } = await auth.json();

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  if (request.method === "POST") {
    await dattiClient.users._uid(uid).requests.$post();
  } else if (request.method === "DELETE") {
    await dattiClient.friends._uid(uid).$delete();
  }

  return json({});
};

export type FriendsAction = typeof friendsAction;
