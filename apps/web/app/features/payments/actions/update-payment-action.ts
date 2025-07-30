import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

import { updatePaymentSchema as schema } from "../schemas";

export const updatePaymentAction = async ({
	request,
	params,
}: ActionFunctionArgs) => {
	const client = createAPIClient();

	const formData = await request.formData();

	if (request.method !== "PUT") {
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
	const paymentId = params.paymentId;
	if (paymentId === undefined) {
		return {
			message: "支払いIDの取得に失敗しました",
			submission: submission.reply(),
		};
	}
	try {
		await client.payments._paymentId(paymentId).$put({
			body: submission.value,
		});
		return {
			message: "返済を更新しました",
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

export type UpdatePaymentAction = typeof updatePaymentAction;
