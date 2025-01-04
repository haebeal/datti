import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const groupLoader = async ({ params }: LoaderFunctionArgs) => {
	const groupId = params.groupId;
	if (groupId === undefined) {
		throw new Response("グループIDの取得に失敗しました", {
			status: 400,
			statusText: "Bad Request",
		});
	}

	const client = createAPIClient();

	const group = client.groups._groupId(groupId).$get();

	return defer({
		group,
	});
};

export type GroupLoader = typeof groupLoader;
