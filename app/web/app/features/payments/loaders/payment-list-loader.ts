import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const paymentListLoader = async ({
	request,
	context,
}: LoaderFunctionArgs) => {
	const { client, headers } = await createAPIClient({ request, context });

	const payments = client.payments.history.$get();

	return defer({ payments }, { headers });
};

export type PaymentListLoader = typeof paymentListLoader;
