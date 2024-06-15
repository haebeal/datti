import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";
import {
  eventCreateFormSchema,
  eventUpdateFormSchema,
} from "~/schema/eventFormSchema";

export const groupEventsAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const groupId = params.groupId;
  if (typeof groupId !== "string") {
    throw new Error();
  }

  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  // イベント作成
  if (request.method === "POST") {
    const submission = parseWithZod(formData, {
      schema: eventCreateFormSchema,
    });

    if (submission.status !== "success") {
      return json({
        message: "Error!",
        submission: submission.reply(),
      });
    }
    await client.groups._groupId(groupId).events.$post({
      body: submission.value,
    });
    return json({
      message: "Success!",
      submission: submission.reply(),
    });
  }

  // イベント更新
  if (request.method === "PUT") {
    const submission = parseWithZod(formData, {
      schema: eventUpdateFormSchema,
    });

    if (submission.status !== "success") {
      return json({
        message: "Error!",
        submission: submission.reply(),
      });
    }

    await client.groups._groupId(groupId).events.$post({
      body: submission.value,
    });
    return json({
      message: "Success!",
      submission: submission.reply(),
    });
  }
};

export type GroupEventsAction = typeof groupEventsAction;
