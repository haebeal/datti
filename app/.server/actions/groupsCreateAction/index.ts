import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";
import { groupFormSchema } from "~/schema/groupFormSchema";

export const groupsCreateAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
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

  const result = await dattiClient.groups.$post({
    body: submission.value,
  });

  return redirect(`/groups/${result.id}`);
};
