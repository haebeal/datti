import createClient from "openapi-fetch";
import { userManager } from "@/libs/auth/cognito";
import type { paths } from "./schema";

export const apiClient = createClient<paths>({
	baseUrl: import.meta.env.VITE_API_URL,
});

apiClient.use({
	async onRequest({ request }) {
		const user = await userManager.getUser();
		if (user && !user.expired) {
			request.headers.set("Authorization", `Bearer ${user.access_token}`);
		}
		return request;
	},
});
