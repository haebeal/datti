import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthSessionStorage } from "~/lib/authSession.server";
import { refreshFirebaseIdToken } from "~/lib/oauthClient.server";

export async function getIdToken({ request, context }: LoaderFunctionArgs) {
  const authSessionStorage = getAuthSessionStorage(context);
  const authSession = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );

  if (!authSession.has("idToken")) {
    throw redirect("/signin");
  }

  const idToken = authSession.get("idToken");
  const oldRefreshToken = authSession.get("refreshToken");
  const expiresDateTime = authSession.get("expiresDateTime");

  if (!idToken || !expiresDateTime || !oldRefreshToken) {
    throw redirect("/signin");
  }

  if (new Date() < new Date(expiresDateTime)) {
    return { idToken };
  }

  const dt = new Date();
  const { id_token, refresh_token, expires_in } = await refreshFirebaseIdToken(
    context.cloudflare.env.FIREBASE_API_KEY,
    oldRefreshToken
  );
  dt.setSeconds(dt.getSeconds() + Number(expires_in));
  authSession.set("idToken", id_token);
  authSession.set("refreshToken", refresh_token);
  authSession.set("expiresDateTime", dt.toISOString());

  return { idToken, authSession };
}
