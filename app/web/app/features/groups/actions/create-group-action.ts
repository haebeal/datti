import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

import { createGroupSchema as schema } from "../schemas";

export const createGroupAction = async ({ request }: ActionFunctionArgs) => {
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

	if (request.method !== "POST") {
		return {
			message: "許可されていないメソッドです",
			submission: submission.reply(),
		};
	}

	try {
		const { name } = await client.groups.$post({
			body: {
				...submission.value,
				userIds: [],
			},
		});
		return {
			message: `${name}を作成しました`,
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

export type CreateGroupAction = typeof createGroupAction;
