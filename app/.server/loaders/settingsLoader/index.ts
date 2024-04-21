import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders/authLoader";
import { createDattiClient } from "~/lib/apiClient";

export const settingsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const auth = await authLoader({
    request,
    params,
    context,
  });
  const { idToken } = await auth.json();

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
