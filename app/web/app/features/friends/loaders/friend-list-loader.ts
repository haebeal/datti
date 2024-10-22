import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const friendListLoader = async ({
	request,
	context,
}: LoaderFunctionArgs) => {
	const { client, headers } = await createAPIClient({ request, context });

	// フレンド一覧を取得
	const friends = client.users.$get({
		query: {
			status: "friend",
		},
	});

	// 申請中一覧を取得
	const requestings = client.users.$get({
		query: {
			status: "requesting",
		},
	});

	// 受理中一覧を取得
	const applyings = client.users.$get({
		query: {
			status: "applying",
		},
	});

	return defer(
		{
			friends,
			requestings,
			applyings,
		},
		{ headers },
	);
};

export type FriendListLoader = typeof friendListLoader;
