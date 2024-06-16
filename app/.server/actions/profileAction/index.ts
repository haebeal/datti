import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";
import { profileFormSchema } from "~/schema/profileFormSchema";

export const profileAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  const formData = await request.formData();

  // プロフィール更新処理
  if (request.method === "POST") {
    const submission = parseWithZod(formData, { schema: profileFormSchema });
    if (submission.status !== "success") {
      return json({
        message: "バリデーションに失敗しました",
        submission: submission.reply(),
      });
    }
    try {
      await client.users.me.$put({
        body: submission.value,
      });
      return json({
        message: "プロフィールを更新しました",
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

export type ProfileAction = typeof profileAction;
