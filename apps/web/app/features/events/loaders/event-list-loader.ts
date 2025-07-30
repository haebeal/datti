import type { LoaderFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

export const eventListLoader = async ({ params }: LoaderFunctionArgs) => {
	const groupId = params.groupId;
	if (groupId === undefined) {
		throw new Response("グループIDの取得に失敗しました", {
			status: 400,
			statusText: "Bad Request",
		});
	}

	const client = createAPIClient();

	const events = client.groups._groupId(groupId).events.$get();

	return { events };
};

export type EventListLoader = typeof eventListLoader;
