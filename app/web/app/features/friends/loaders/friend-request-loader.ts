import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const friendRequestLoader = async ({
	request,
	context,
}: LoaderFunctionArgs) => {
	const { searchParams } = new URL(request.url);
	const searchQuery = searchParams.get("q")?.toString();

	const { client, headers } = await createAPIClient({ request, context });

	// フレンド申請対象となるユーザー一覧を取得
	const users = client.users.$get({
		query: {
			status: "none",
			email: searchQuery,
		},
	});

	return defer(
		{
			users,
		},
		{ headers },
	);
};

export type FriendRequestLoader = typeof friendRequestLoader;
