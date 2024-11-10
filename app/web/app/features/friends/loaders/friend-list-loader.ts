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

	return defer(
		{
			friends,
		},
		{ headers },
	);
};

export type FriendListLoader = typeof friendListLoader;
