import { HTTPError } from "@aspida/fetch";
import type { ActionFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

export const applyFriendAction = async ({ request }: ActionFunctionArgs) => {
	const client = createAPIClient();

	const formData = await request.formData();

	if (request.method !== "POST" && request.method !== "DELETE") {
		return {
			message: "許可されていないメソッドです",
			submission: undefined,
		};
	}

	const userId = formData.get("userId")?.toString();
	if (userId === undefined) {
		return {
			message: "ユーザーIDの取得に失敗しました",
			submission: undefined,
		};
	}

	try {
		if (request.method === "POST") {
			const { message } = await client.users._userId(userId).requests.$post();
			return {
				message,
				submission: undefined,
			};
		}
		const { message } = await client.users.friends._userId(userId).$delete();
		return {
			message,
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

	throw new Response("不明なエラーが発生しました", {
		status: 500,
		statusText: "Internal Server Error",
	});
};

export type ApplyFriendAction = typeof applyFriendAction;
