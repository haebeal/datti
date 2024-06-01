import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";
import { eventFormSchema } from "~/schema/eventFormSchema";

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

  const submission = parseWithZod(formData, {
    schema: eventFormSchema,
  });

  if (submission.status !== "success") {
    return json({
      message: "Error!",
      submission: submission.reply(),
    });
  }

  const { idToken } = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  if (request.method === "POST") {
    await dattiClient.groups._groupId(groupId).events.$post({
      body: submission.value,
    });
  } else if (request.method === "PUT") {
    const eventId = params.eventId;
    if (typeof eventId !== "string") {
      throw new Error();
    }

    await dattiClient.groups._groupId(groupId).events._eventId(eventId).$put({
      body: submission.value,
    });
  }

  return json({
    message: "Success!",
    submission: submission.reply(),
  });
};

export type GroupEventsAction = typeof groupEventsAction;
