import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders";
import { createDattiClient } from "~/lib/apiClient";
import { groupSchema } from "~/schema/group";

export const groupSettingsAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const groupId = params.id;

  if (typeof groupId !== "string") {
    throw new Error();
  }

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: groupSchema,
  });

  if (submission.status !== "success") {
    return json(submission.reply());
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
  await dattiClient.groups._groupId(groupId).$put({
    body: submission.value,
  });

  return json(submission.reply());
};

export type GroupSettingsAction = typeof groupSettingsAction;
