import { defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const groupListLoader = async () => {
	const client = createAPIClient();

	const groups = client.groups.$get();

	return defer({
		groups,
	});
};

export type GroupListLoader = typeof groupListLoader;
