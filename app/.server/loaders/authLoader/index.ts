import { LoaderFunctionArgs, defer, redirect } from "@remix-run/cloudflare";
import { createDattiClient } from "~/lib/apiClient";
import { getAuthSessionStorage } from "~/lib/authSession.server";
import { getIdToken } from "~/lib/getIdToken.server";

export const authLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const { idToken, authSession } = await getIdToken({
    request,
    params,
    context,
  });
  if (!idToken) {
    throw redirect("/signin");
  }

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );
  const profile = dattiClient.users.me.$get();

  const authSessionStorage = getAuthSessionStorage(context);

  return defer(
    {
      profile,
    },
    authSession
      ? {
          headers: {
            "Set-Cookie": await authSessionStorage.commitSession(authSession),
          },
        }
      : undefined
  );
};

export type AuthLoader = typeof authLoader;
