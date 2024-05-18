import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";
import { profileFormSchema } from "~/schema/profileFormSchema";

export const profileAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: profileFormSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { idToken } = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  await dattiClient.users.me.$put({
    body: submission.value,
  });

  return json(submission.reply());
};

export type ProfileAction = typeof profileAction;
