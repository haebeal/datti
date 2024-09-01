import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createAPIClient } from "~/lib/apiClient";

export const paymentsLoader = async ({
  request,
  context,
}: LoaderFunctionArgs) => {
  const { client, headers } = await createAPIClient({ request, context });

  const payments = client.payments.$get();
  const history = client.payments.history.$get();

  return defer({ payments, history }, { headers });
};

export type PaymentsLoader = typeof paymentsLoader;
