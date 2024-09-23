import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

import { createGroupSchema as schema } from "../schemas";

export const createGroupAction = async ({
	request,
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

	if (request.method !== "POST") {
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

	try {
		const { name } = await client.groups.$post({
			body: {
				...submission.value,
				userIds: [],
			},
		});
		return json(
			{
				message: `${name}を作成しました`,
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

export type CreateGroupAction = typeof createGroupAction;
