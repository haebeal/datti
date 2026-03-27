import { redirect } from "next/navigation";
import crypto from "node:crypto";

export async function GET() {
  const channelId = process.env.LINE_CHANNEL_ID;
  const appUrl = process.env.APP_URL;
  const redirectUri = `${appUrl}/api/auth/line/callback`;

  if (!channelId) {
    console.error("LINE environment variables are not set");
    return redirect("/profile?error=server_error");
  }

  const state = crypto.randomBytes(32).toString("base64url");

  const authUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", channelId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "profile openid");

  return redirect(authUrl.toString());
}
