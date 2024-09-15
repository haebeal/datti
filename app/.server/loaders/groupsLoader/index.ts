import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const groupsLoader = async ({
	request,
	context,
}: LoaderFunctionArgs) => {
	const { client, headers } = await createAPIClient({ request, context });

	const groups = client.groups.$get();

	return defer(
		{
			groups,
		},
		{
			headers,
		},
	);
};

export type GroupsLoader = typeof groupsLoader;
