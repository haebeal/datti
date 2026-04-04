import { redirect } from "next/navigation";

export async function GET() {
  const cognitoDomain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const appUrl = process.env.APP_URL;
  const redirectUri = `${appUrl}/api/auth/cognito/callback`;

  if (!cognitoDomain || !clientId) {
    console.error("Cognito environment variables are not set");
    return redirect("/auth?error=server_error");
  }

  const state = JSON.stringify({ timestamp: Date.now() });
  const encodedState = Buffer.from(state).toString("base64url");

  const authUrl = new URL(`${cognitoDomain}/oauth2/authorize`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile aws.cognito.signin.user.admin");
  authUrl.searchParams.set("state", encodedState);
  authUrl.searchParams.set("identity_provider", "LINE");

  return redirect(authUrl.toString());
}
