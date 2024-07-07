import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";
import {
  paymentCreateFormSchema,
  paymentUpdateFormSchema,
} from "~/schema/paymentFormSchema";

export const paymentAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  const formData = await request.formData();

  // 返済作成処理
  if (request.method === "POST") {
    const submission = parseWithZod(formData, {
      schema: paymentCreateFormSchema,
    });
    if (submission.status !== "success") {
      return json({
        message: "バリデーションに失敗しました",
        submission: submission.reply(),
      });
    }
    try {
      await client.payments.$post({
        body: submission.value,
      });
      return json({
        message: "返済を作成しました",
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

  // 返済更新処理
  if (request.method === "PUT") {
    const submission = parseWithZod(formData, {
      schema: paymentUpdateFormSchema,
    });
    if (submission.status !== "success") {
      return json({
        message: "バリデーションに失敗しました",
        submission: submission.reply(),
      });
    }
    const paymentId = params.paymentId;
    if (paymentId === undefined) {
      return json({
        message: "支払いIDの取得に失敗しました",
        submission: submission.reply(),
      });
    }
    try {
      await client.payments._paymentId(paymentId).$put({
        body: submission.value,
      });
      return json({
        message: "返済を更新しました",
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

export type paymentAction = typeof paymentAction;
