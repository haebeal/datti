import { defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const friendListLoader = async () => {
	const client = createAPIClient();

	// フレンド一覧を取得
	const friends = client.users.$get({
		query: {
			status: "friend",
		},
	});

	return defer({
		friends,
	});
};

export type FriendListLoader = typeof friendListLoader;
