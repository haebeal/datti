import { HTTPError } from "@aspida/fetch";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const friendAction = async ({
  request,
  context,
}: ActionFunctionArgs) => {
  const { client } = await createAPIClient({ request, context });

  const formData = await request.formData();

  // フレンド申請処理
  if (request.method === "POST") {
    const userId = formData.get("userId")?.toString();
    if (userId === undefined) {
      return json({
        message: "ユーザーIDの取得に失敗しました",
        submission: undefined,
      });
    }
    try {
      const { message } = await client.users._userId(userId).requests.$post();
      return json({
        message,
        submission: undefined,
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

  // フレンド削除、申請取り消し・却下処理
  if (request.method === "DELETE") {
    const userId = formData.get("userId")?.toString();
    if (userId === undefined) {
      return json({
        message: "ユーザーIDの取得に失敗しました",
        submission: undefined,
      });
    }
    try {
      await client.users._userId(userId).requests.$post();
      const { message } = await client.users.friends._userId(userId).$delete();
      return json({
        message,
        submission: undefined,
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

export type FriendAction = typeof friendAction;
