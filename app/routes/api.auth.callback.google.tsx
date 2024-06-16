import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthSessionStorage } from "~/lib/authSession.server";
import { signInFirebase } from "~/lib/oauthClient.server";

type TokenResponse = {
  id_token: string;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.toString();

  if (!code) {
    throw new Response(undefined, {
      status: 400,
    });
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/token?code=${code}&client_id=${context.cloudflare.env.GOOGLE_CLIENT_ID}&client_secret=${context.cloudflare.env.GOOGLE_CLIENT_SECRET}&redirect_uri=${context.cloudflare.env.CLIENT_URL}/api/auth/callback/google&grant_type=authorization_code`,
    {
      method: "POST",
    }
  );

  const tokens = await response.json<TokenResponse>();

  if (!tokens.id_token) {
    throw new Response(undefined, {
      status: 400,
    });
  }

  const dt = new Date();
  const { idToken, refreshToken, expiresIn } = await signInFirebase(
    context.cloudflare.env.CLIENT_URL,
    context.cloudflare.env.FIREBASE_TENANT_ID,
    context.cloudflare.env.FIREBASE_API_KEY,
    tokens.id_token
  );
  dt.setSeconds(dt.getSeconds() + Number(expiresIn));

  const authSessionStorage = getAuthSessionStorage(context);
  const authSession = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );

  authSession.set("idToken", idToken);
  authSession.set("refreshToken", refreshToken);
  authSession.set("expiresDateTime", dt.toISOString());

  return redirect("/", {
    headers: {
      "Set-Cookie": await authSessionStorage.commitSession(authSession),
    },
  });
};
