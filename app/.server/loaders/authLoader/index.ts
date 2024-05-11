import { LoaderFunctionArgs, defer, redirect } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getIdToken } from "~/lib/getIdToken.server";

export const authLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const idToken = await getIdToken({ request, params, context });
  if (!idToken) {
    throw redirect("/signin");
  }

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );
  const profile = dattiClient.users.me.$get();
  console.log(profile);

  return defer({
    profile,
  });
};

export type AuthLoader = typeof authLoader;
