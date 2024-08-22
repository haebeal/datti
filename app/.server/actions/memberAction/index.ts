import { HTTPError } from "@aspida/fetch";
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const memberAction = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const { client } = await createAPIClient({ request, context });

  const formData = await request.formData();

  // メンバー追加処理
  if (request.method === "POST") {
    const groupId = params.groupId;
    const userId = formData.get("userId")?.toString();
    if (userId === undefined) {
      return json({
        message: "ユーザーIDの取得に失敗しました",
        submission: undefined,
      });
    }
    if (groupId === undefined) {
      return json({
        message: "グループIDの取得に失敗しました",
        submission: undefined,
      });
    }
    try {
      const { members } = await client.groups._groupId(groupId).members.$post({
        body: {
          userIds: [userId],
        },
      });
      return json({
        message: `${members[0].name}をメンバーに追加しました`,
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

export type MemberAction = typeof memberAction;
