import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

import { updateProfileSchema as schema } from "../schemas";

export const updateProfileAction = async ({ request }: ActionFunctionArgs) => {
	const client = createAPIClient();

	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema });
	if (submission.status !== "success") {
		return json({
			message: "バリデーションに失敗しました",
			submission: submission.reply(),
		});
	}

	if (request.method !== "POST") {
		return json({
			message: "許可されていないメソッドです",
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

	throw new Response("不明なエラーが発生しました", {
		status: 500,
		statusText: "Internal Server Error",
	});
};

export type UpdateProfileAction = typeof updateProfileAction;
