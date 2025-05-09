import { createAPIClient } from "~/lib/apiClient";

export const profileLoader = async () => {
	const client = createAPIClient();
	const profile = client.users.me.$get();

	// セッション更新のため、SessionStorageの取得を行う
	return { profile };
};

export type ProfileLoader = typeof profileLoader;
