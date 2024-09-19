import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const authLoader = async ({ request, context }: LoaderFunctionArgs) => {
	const { client, headers } = await createAPIClient({ request, context });
	const profile = client.users.me.$get();

	// セッション更新のため、SessionStorageの取得を行う
	return defer(
		{
			profile,
		},
		{ headers },
	);
};

export type AuthLoader = typeof authLoader;
