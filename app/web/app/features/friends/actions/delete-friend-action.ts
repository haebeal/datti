import { HTTPError } from "@aspida/fetch";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const deleteFriendAction = async ({ request }: ActionFunctionArgs) => {
	const client = createAPIClient();

	const formData = await request.formData();

	if (request.method !== "DELETE") {
		return json({
			message: "許可されていないメソッドです",
			submission: undefined,
		});
	}

	const userId = formData.get("userId")?.toString();
	if (userId === undefined) {
		return json({
			message: "ユーザーIDの取得に失敗しました",
			submission: undefined,
		});
	}

	try {
		const { message } = await client.users.friends._userId(userId).$delete();
		return json({
			message,
			submission: undefined,
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

export type DeleteFriendAction = typeof deleteFriendAction;
