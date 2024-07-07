import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare";
import { createClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const paymentsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const { idToken } = await getIdToken({ request, params, context });
  const client = createClient(idToken, context.cloudflare.env.BACKEND_ENDPOINT);

  const payments = client.payments.$get();
  const history = client.payments.history.$get();

  return defer({ payments, history });
};

export type PaymentsLoader = typeof paymentsLoader;
