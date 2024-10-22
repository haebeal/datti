import { type LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const paymentUserListLoader = async ({
	request,
	context,
}: LoaderFunctionArgs) => {
	const { client, headers } = await createAPIClient({ request, context });

	const paymentUsers = client.payments.$get();

	return defer({ paymentUsers }, { headers });
};

export type PaymentUserListLoader = typeof paymentUserListLoader;
