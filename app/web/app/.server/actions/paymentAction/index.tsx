import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";
import {
	paymentCreateFormSchema,
	paymentUpdateFormSchema,
} from "~/schema/paymentFormSchema";

export const paymentAction = async ({
	request,
	params,
	context,
}: ActionFunctionArgs) => {
	const { client, headers } = await createAPIClient({ request, context });

	const formData = await request.formData();

	// 返済作成処理
	if (request.method === "POST") {
		const submission = parseWithZod(formData, {
			schema: paymentCreateFormSchema,
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
		try {
			await client.payments.$post({
				body: submission.value,
			});
			return json(
				{
					message: "返済を作成しました",
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
	}

	// 返済更新処理
	if (request.method === "PUT") {
		const submission = parseWithZod(formData, {
			schema: paymentUpdateFormSchema,
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
		const paymentId = params.paymentId;
		if (paymentId === undefined) {
			return json(
				{
					message: "支払いIDの取得に失敗しました",
					submission: submission.reply(),
				},
				{
					headers,
				},
			);
		}
		try {
			await client.payments._paymentId(paymentId).$put({
				body: submission.value,
			});
			return json(
				{
					message: "返済を更新しました",
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
	}

	throw new Response("不明なエラーが発生しました", {
		status: 500,
		statusText: "Internal Server Error",
		headers,
	});
};

export type paymentAction = typeof paymentAction;
