import type { LoaderFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

export const friendRequestLoader = async ({ request }: LoaderFunctionArgs) => {
	const { searchParams } = new URL(request.url);
	const searchQuery = searchParams.get("q")?.toString();

	const client = createAPIClient();

	// フレンド申請対象となるユーザー一覧を取得
	const users = client.users.$get({
		query: {
			status: "none",
			email: searchQuery,
		},
	});

	return {
		users,
	};
};

export type FriendRequestLoader = typeof friendRequestLoader;
