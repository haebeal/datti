import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

import { updateGroupSchema as schema } from "../schemas";

export const updateGroupAction = async ({
	request,
	params,
}: ActionFunctionArgs) => {
	const client = createAPIClient();

	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema,
	});
	if (submission.status !== "success") {
		return {
			message: "バリデーションに失敗しました",
			submission: submission.reply(),
		};
	}

	if (request.method !== "PUT") {
		return {
			message: "許可されていないメソッドです",
			submission: submission.reply(),
		};
	}

	const groupId = params.groupId;
	if (groupId === undefined) {
		return {
			message: "グループIDの取得に失敗しました",
			submission: submission.reply(),
		};
	}

	try {
		await client.groups._groupId(groupId).$put({
			body: submission.value,
		});
		return {
			message: "グループを更新しました",
			submission: submission.reply(),
		};
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

export type UpdateGroupAction = typeof updateGroupAction;
