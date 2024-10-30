import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

import { updateGroupSchema as schema } from "../schemas";

export const updateGroupAction = async ({
	request,
	params,
	context,
}: ActionFunctionArgs) => {
	const { client, headers } = await createAPIClient({ request, context });

	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema,
	});
	if (submission.status !== "success") {
		return json(
			{
				message: "バリデーションに失敗しました",
				submission: submission.reply(),
			},
			{
				headers,
			},
		);
	}

	if (request.method !== "PUT") {
		return json(
			{
				message: "許可されていないメソッドです",
				submission: submission.reply(),
			},
			{
				headers,
			},
		);
	}

	const groupId = params.groupId;
	if (groupId === undefined) {
		return json(
			{
				message: "グループIDの取得に失敗しました",
				submission: submission.reply(),
			},
			{
				headers,
			},
		);
	}

	try {
		await client.groups._groupId(groupId).$put({
			body: submission.value,
		});
		return json(
			{
				message: "グループを更新しました",
				submission: submission.reply(),
			},
			{
				headers,
			},
		);
	} catch (error) {
		if (error instanceof HTTPError) {
			throw new Response(error.message, {
				status: error.response.status,
				statusText: error.response.statusText,
				headers,
			});
		}
	}

	throw new Response("不明なエラーが発生しました", {
		status: 500,
		statusText: "Internal Server Error",
		headers,
	});
};

export type UpdateGroupAction = typeof updateGroupAction;
