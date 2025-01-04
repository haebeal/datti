import { HTTPError } from "@aspida/fetch";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

import { deleteEventSchema as schema } from "../schemas";

export const deleteEventAction = async ({
	request,
	params,
}: ActionFunctionArgs) => {
	const client = createAPIClient();

	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema,
	});
	if (submission.status !== "success") {
		return json({
			message: "バリデーションに失敗しました",
			submission: submission.reply(),
		});
	}

	if (request.method !== "DELETE") {
		return json({
			message: "許可されていないメソッドです",
			submission: submission.reply(),
		});
	}

	const groupId = params.groupId;
	if (groupId === undefined) {
		return json({
			message: "グループIDの取得に失敗しました",
			submission: submission.reply(),
		});
	}

	try {
		const eventId = submission.value.eventId;
		await client.groups._groupId(groupId).events._eventId(eventId).$delete();
		return json({
			message: "イベントを削除しました",
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

export type DeleteEventAction = typeof deleteEventAction;
