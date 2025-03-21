import type { LoaderFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

export const memberListLoader = async ({ params }: LoaderFunctionArgs) => {
	const groupId = params.groupId;
	if (groupId === undefined) {
		throw new Response("グループIDの取得に失敗しました", {
			status: 400,
			statusText: "Bad Request",
		});
	}

	const client = createAPIClient();

	const members = client.groups._groupId(groupId).members.$get();

	return { members };
};

export type MemberListLoader = typeof memberListLoader;
