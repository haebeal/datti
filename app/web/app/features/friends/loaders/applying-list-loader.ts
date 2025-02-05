import { createAPIClient } from "~/lib/apiClient";

export const applyingListLoader = async () => {
	const client = createAPIClient();

	// 受理中一覧を取得
	const applyingList = client.users.$get({
		query: {
			status: "applying",
		},
	});

	return {
		applyingList,
	};
};

export type ApplyingListLoader = typeof applyingListLoader;
