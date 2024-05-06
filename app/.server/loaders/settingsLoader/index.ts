import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const settingsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const idToken = await getIdToken({ request, params, context });
  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const bankAccount = await dattiClient.bank.$get();

  return {
    bankAccount,
  };
};

export type SettingsLoader = typeof settingsLoader;
