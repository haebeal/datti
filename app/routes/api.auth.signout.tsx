import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthSessionStorage } from "~/lib/authSession.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const authSessionStorage = getAuthSessionStorage(context);
  const authSession = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await authSessionStorage.destroySession(authSession),
    },
  });
};
