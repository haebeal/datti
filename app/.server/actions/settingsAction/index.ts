import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders";
import { createDattiClient } from "~/lib/apiClient";
import { bankAccountSchema } from "~/schema/bank";

export const settingsAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: bankAccountSchema,
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
  await dattiClient.bank.$post({
    body: submission.value,
  });

  return json(submission.reply());
};
