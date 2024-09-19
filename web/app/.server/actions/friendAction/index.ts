import { HTTPError } from "@aspida/fetch";
import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const friendAction = async ({
	request,
	context,
}: ActionFunctionArgs) => {
	const { client, headers } = await createAPIClient({ request, context });

	const formData = await request.formData();

	// フレンド申請処理
	if (request.method === "POST") {
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
	}

	// フレンド削除、申請取り消し・却下処理
	if (request.method === "DELETE") {
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
			await client.users._userId(userId).requests.$post();
			const { message } = await client.users.friends._userId(userId).$delete();
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
	}

	throw new Response("不明なエラーが発生しました", {
		status: 500,
		statusText: "Internal Server Error",
		headers,
	});
};

export type FriendAction = typeof friendAction;
