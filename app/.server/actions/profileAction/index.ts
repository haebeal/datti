import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";
import { userSchema } from "~/schema/user";

export const profileAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: userSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const idToken = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  await dattiClient.users.me.$put({
    body: {
      name: submission.value.name,
      photoUrl: submission.value.photoUrl,
      bankCode: submission.value.bank.bankCode,
      branchCode: submission.value.bank.branchCode,
      accountCode: submission.value.bank.accountCode,
    },
  });

  return json(submission.reply());
};

export type ProfileAction = typeof profileAction;
