import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders";
import { createDattiClient } from "~/lib/apiClient";
import { groupSchema } from "~/schema/group";

export const groupsCreateAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
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
  const result = await dattiClient.groups.$post({
    body: submission.value,
  });

  return redirect(`/groups/${result.id}`);
};
