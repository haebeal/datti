import type { LoaderFunctionArgs } from "react-router";
import { createAPIClient } from "~/lib/apiClient";

export const eventLoader = async ({ params }: LoaderFunctionArgs) => {
	const groupId = params.groupId;
	if (groupId === undefined) {
		throw new Response("グループIDの取得に失敗しました", {
			status: 400,
			statusText: "Bad Request",
		});
	}

	const eventId = params.eventId;
	if (eventId === undefined) {
		throw new Response("イベントIDの取得に失敗しました", {
			status: 400,
			statusText: "Bad Request",
		});
	}

	const client = createAPIClient();

	const event = client.groups._groupId(groupId).events._eventId(eventId).$get();
	const members = client.groups._groupId(groupId).members.$get();

	return { event, members };
};

export type EventLoader = typeof eventLoader;
