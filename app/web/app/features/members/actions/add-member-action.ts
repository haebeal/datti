import { HTTPError } from "@aspida/fetch";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const addMemberAction = async ({
	request,
	params,
}: ActionFunctionArgs) => {
	const client = createAPIClient();

	const formData = await request.formData();

	if (request.method !== "POST") {
		return json({
			message: "許可されていないメソッドです",
			submission: undefined,
		});
	}

	const groupId = params.groupId;
	if (groupId === undefined) {
		return json({
			message: "グループIDの取得に失敗しました",
			submission: undefined,
		});
	}

	const userId = formData.get("userId")?.toString();
	if (userId === undefined) {
		return json({
			message: "ユーザーIDの取得に失敗しました",
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

	throw new Response("不明なエラーが発生しました", {
		status: 500,
		statusText: "Internal Server Error",
	});
};

export type AddMemberAction = typeof addMemberAction;
