import { createAPIClient } from "~/lib/apiClient";

export const groupListLoader = async () => {
	const client = createAPIClient();

	const groups = client.groups.$get();

	return {
		groups,
	};
};

export type GroupListLoader = typeof groupListLoader;
