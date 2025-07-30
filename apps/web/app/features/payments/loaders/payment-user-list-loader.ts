import { createAPIClient } from "~/lib/apiClient";

export const paymentUserListLoader = async () => {
	const client = createAPIClient();

	const paymentUsers = client.payments.$get();

	return { paymentUsers };
};

export type PaymentUserListLoader = typeof paymentUserListLoader;
