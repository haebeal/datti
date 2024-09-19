import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";
import {
	eventCreateFormSchema,
	eventDeleteFormSchema,
	eventUpdateFormSchema,
} from "~/schema/eventFormSchema";

export const eventAction = async ({
	request,
	params,
	context,
}: ActionFunctionArgs) => {
	const { client, headers } = await createAPIClient({ request, context });

	const formData = await request.formData();

	// イベント作成処理
	if (request.method === "POST") {
		const submission = parseWithZod(formData, {
			schema: eventCreateFormSchema,
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
			const { name } = await client.groups._groupId(groupId).events.$post({
				body: submission.value,
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
	}

	// イベント更新処理
	if (request.method === "PUT") {
		const submission = parseWithZod(formData, {
			schema: eventUpdateFormSchema,
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
		const eventId = params.eventId;
		if (eventId === undefined) {
			return json(
				{
					message: "イベントIDの取得に失敗しました",
					submission: submission.reply(),
				},
				{
					headers,
				},
			);
		}
		try {
			await client.groups._groupId(groupId).events._eventId(eventId).$put({
				body: submission.value,
			});
			return json(
				{
					message: "イベントを更新しました",
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

	// イベント削除処理
	if (request.method === "DELETE") {
		const submission = parseWithZod(formData, {
			schema: eventDeleteFormSchema,
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
		const eventId = submission.value.eventId;
		try {
			await client.groups._groupId(groupId).events._eventId(eventId).$delete();
			return json(
				{
					message: "イベントを削除しました",
					submission: submission.reply(),
				},
				{ headers },
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

export type EventAction = typeof eventAction;
