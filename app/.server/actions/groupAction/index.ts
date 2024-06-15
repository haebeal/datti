import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";
import { groupFormSchema } from "~/schema/groupFormSchema";

export const groupAction = async ({
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

  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  if (request.method === "POST") {
    await client.groups.$post({
      body: {
        ...submission.value,
        uids: [],
      },
    });
  } else if (request.method === "PUT") {
    const groupId = params.groupId;
    if (typeof groupId !== "string") {
      throw new Error();
    }
    await client.groups._groupId(groupId).$put({
      body: submission.value,
    });
  }

  return json(submission.reply());
};

export type GroupAction = typeof groupAction;
