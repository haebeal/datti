import { HTTPError } from "@aspida/fetch";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const createFriendAction = async ({
	request,
	context,
}: ActionFunctionArgs) => {
	const { client, headers } = await createAPIClient({
		request,
		context,
	});

	const formData = await request.formData();

	if (request.method !== "POST") {
		return json(
			{
				message: "許可されていないメソッドです",
				submission: undefined,
			},
			{
				headers,
			},
		);
	}

	const userId = formData.get("userId")?.toString();
	if (userId === undefined) {
		return json(
			{
				message: "ユーザーIDの取得に失敗しました",
				submission: undefined,
			},
			{
				headers,
			},
		);
	}

	try {
		const { message } = await client.users._userId(userId).requests.$post();
		return json(
			{
				message,
				submission: undefined,
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

	throw new Response("不明なエラーが発生しました", {
		status: 500,
		statusText: "Internal Server Error",
		headers,
	});
};

export type CreateFriendAction = typeof createFriendAction;
