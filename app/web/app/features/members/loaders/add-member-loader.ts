import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";

import { createAPIClient } from "~/lib/apiClient";

export const addMemberLoader = async ({
	request,
	params,
}: LoaderFunctionArgs) => {
	const { searchParams } = new URL(request.url);
	const searchQuery = searchParams.get("q")?.toString();

	const groupId = params.groupId;
	if (groupId === undefined) {
		throw new Response("グループIDの取得に失敗しました", {
			status: 400,
			statusText: "Bad Request",
		});
	}

	const client = createAPIClient();

	const members = client.groups._groupId(groupId).members.$get();
	const users = client.users.$get({
		query: {
			email: searchQuery,
		},
	});

	return defer({ members, users });
};

export type AddMemberLoader = typeof addMemberLoader;
