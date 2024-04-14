import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/lib/authSession.server";
import { oauth2Client, signInFirebase } from "~/lib/oauthClient.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    throw new Response(undefined, {
      status: 400,
    });
  }

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.id_token) {
    throw new Response(undefined, {
      status: 400,
    });
  }

  const dt = new Date();
  const { idToken, refreshToken, expiresIn } = await signInFirebase(
    tokens.id_token
  );
  dt.setSeconds(dt.getSeconds() + Number(expiresIn));

  const authSession = await getSession(request.headers.get("Cookie"));

  authSession.set("idToken", idToken);
  authSession.set("refreshToken", refreshToken);
  authSession.set("expiresDateTime", dt.toISOString());

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(authSession),
    },
  });
};
