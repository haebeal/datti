import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

import { createPaymentSchema as schema } from "../schemas";

export const createPaymentAction = async ({ request }: ActionFunctionArgs) => {
	const client = createAPIClient();

	const formData = await request.formData();

	if (request.method !== "POST") {
		return {
			message: "許可されていないメソッドです",
			submission: undefined,
		};
	}

	const submission = parseWithZod(formData, {
		schema,
	});
	if (submission.status !== "success") {
		return {
			message: "バリデーションに失敗しました",
			submission: submission.reply(),
		};
	}
	try {
		await client.payments.$post({
			body: submission.value,
		});
		return {
			message: "返済を作成しました",
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

export type CreatePaymentSchema = typeof createPaymentAction;
