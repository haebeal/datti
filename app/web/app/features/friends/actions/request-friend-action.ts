import { HTTPError } from "@aspida/fetch";
import type { ActionFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

export const requestFriendAction = async ({ request }: ActionFunctionArgs) => {
	const client = createAPIClient();

	const formData = await request.formData();

	if (request.method !== "POST") {
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
		const { message } = await client.users._userId(userId).requests.$post();
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

export type RequestFriendAction = typeof requestFriendAction;
