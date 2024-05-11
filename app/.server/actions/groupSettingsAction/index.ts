import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";
import { groupFormSchema } from "~/schema/groupFormSchema";

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
    schema: groupFormSchema,
  });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const idToken = await getIdToken({ request, params, context });
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
