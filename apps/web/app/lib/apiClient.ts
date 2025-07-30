import fetchClient from "@aspida/fetch";
import { getContext } from "hono/context-storage";
import { redirect } from "react-router";
import type { Env } from "server";
import api from "~/api/$api";

export const createAPIClient = () => {
	const c = getContext<Env>();
	const accessToken = c.get("accessToken");
	if (accessToken === undefined) {
		throw redirect("/signin");
	}

	return api(
		fetchClient(undefined, {
			baseURL: c.env.BACKEND_ENDPOINT,
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			throwHttpErrors: true,
		}),
	);
};
