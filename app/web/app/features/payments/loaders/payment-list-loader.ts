import { defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const paymentListLoader = async () => {
	const client = createAPIClient();

	const payments = client.payments.history.$get();

	return defer({ payments });
};

export type PaymentListLoader = typeof paymentListLoader;
