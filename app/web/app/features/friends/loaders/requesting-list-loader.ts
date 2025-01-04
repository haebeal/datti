import { defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const requestingListLoader = async () => {
	const client = createAPIClient();

	// 申請中一覧を取得
	const requestigList = client.users.$get({
		query: {
			status: "requesting",
		},
	});

	return defer({
		requestigList,
	});
};

export type RequestigListLoader = typeof requestingListLoader;
