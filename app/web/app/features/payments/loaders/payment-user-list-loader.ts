import { defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const paymentUserListLoader = async () => {
	const client = createAPIClient();

	const paymentUsers = client.payments.$get();

	return defer({ paymentUsers });
};

export type PaymentUserListLoader = typeof paymentUserListLoader;
