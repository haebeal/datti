import { HTTPError } from "@aspida/fetch";
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
  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  const formData = await request.formData();

  // グループ作成処理
  if (request.method === "POST") {
    const submission = parseWithZod(formData, {
      schema: groupFormSchema,
    });
    if (submission.status !== "success") {
      return json({
        message: "バリデーションに失敗しました",
        submission: submission.reply(),
      });
    }
    try {
      const { name } = await client.groups.$post({
        body: {
          ...submission.value,
          uids: [],
        },
      });
      return json({
        message: `${name}を作成しました`,
        submission: submission.reply(),
      });
    } catch (error) {
      if (error instanceof HTTPError) {
        throw new Response(error.message, {
          status: error.response.status,
          statusText: error.response.statusText,
        });
      }
    }
  }

  // グループ更新処理
  if (request.method === "PUT") {
    const groupId = params.groupId;
    const submission = parseWithZod(formData, {
      schema: groupFormSchema,
    });
    if (submission.status !== "success") {
      return json({
        message: "バリデーションに失敗しました",
        submission: submission.reply(),
      });
    }
    if (groupId === undefined) {
      return json({
        message: "グループIDの取得に失敗しました",
        submission: submission.reply(),
      });
    }
    try {
      const { name } = await client.groups._groupId(groupId).$put({
        body: submission.value,
      });
      return json({
        message: `グループ名を${name}に更新しました`,
        submission: submission.reply(),
      });
    } catch (error) {
      if (error instanceof HTTPError) {
        throw new Response(error.message, {
          status: error.response.status,
          statusText: error.response.statusText,
        });
      }
    }
  }

  throw new Response("不明なエラーが発生しました", {
    status: 500,
    statusText: "Internal Server Error",
  });
};

export type GroupAction = typeof groupAction;
