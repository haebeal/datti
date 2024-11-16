import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const applyingListLoader = async ({
	request,
	context,
}: LoaderFunctionArgs) => {
	const { client, headers } = await createAPIClient({
		request,
		context,
	});

	// 受理中一覧を取得
	const applyingList = client.users.$get({
		query: {
			status: "applying",
		},
	});

	return defer(
		{
			applyingList,
		},
		{ headers },
	);
};

export type ApplyingListLoader = typeof applyingListLoader;
