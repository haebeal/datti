import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

import { updateEventSchema as schema } from "../schemas";

export const updateEventAction = async ({
	request,
	params,
}: ActionFunctionArgs) => {
	const client = createAPIClient();

	if (request.method !== "PUT" && request.method !== "DELETE") {
		return {
			message: "許可されていないメソッドです",
			submission: undefined,
		};
	}

	const groupId = params.groupId;
	if (groupId === undefined) {
		return {
			message: "グループIDの取得に失敗しました",
			submission: undefined,
		};
	}

	const eventId = params.eventId;
	if (eventId === undefined) {
		return {
			message: "イベントIDの取得に失敗しました",
			submission: undefined,
		};
	}

	// イベント更新処理
	if (request.method === "PUT") {
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

		try {
			await client.groups._groupId(groupId).events._eventId(eventId).$put({
				body: submission.value,
			});
			return {
				message: "イベントを更新しました",
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
	}

	// イベント削除処理
	if (request.method === "DELETE") {
		try {
			await client.groups._groupId(groupId).events._eventId(eventId).$delete();
			return {
				message: "イベントを削除しました",
				submission: undefined,
			};
		} catch (error) {
			if (error instanceof HTTPError) {
				throw new Response(error.message, {
					status: error.response.status,
					statusText: error.response.statusText,
				});
			}
		}
	}

	throw new Response("不明なエラーが発生しました", {
		status: 500,
		statusText: "Internal Server Error",
	});
};

export type UpdateEventAction = typeof updateEventAction;
