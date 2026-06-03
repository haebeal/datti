import createClient from "openapi-fetch";
import { getCurrentAccessToken } from "@/libs/auth/token-store";
import type { paths } from "./schema";

export const apiClient = createClient<paths>({
	baseUrl: import.meta.env.VITE_API_URL,
});

apiClient.use({
	onRequest({ request }) {
		const token = getCurrentAccessToken();
		if (token) {
			request.headers.set("Authorization", `Bearer ${token}`);
		}
		return request;
	},
});
