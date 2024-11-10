import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const requestingListLoader = async ({
	request,
	context,
}: LoaderFunctionArgs) => {
	const { client, headers } = await createAPIClient({
		request,
		context,
	});

	// 申請中一覧を取得
	const requestigList = client.users.$get({
		query: {
			status: "requesting",
		},
	});

	return defer(
		{
			requestigList,
		},
		{ headers },
	);
};

export type RequestigListLoader = typeof requestingListLoader;
