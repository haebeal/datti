import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";

export const loader = () => redirect("/");

export const action = ({ context }: ActionFunctionArgs) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.profile&access_type=offline&include_granted_scopes=true&response_type=code&redirect_uri=${context.cloudflare.env.CLIENT_URL}/api/auth/callback/google&client_id=${context.cloudflare.env.GOOGLE_CLIENT_ID}`;

  return redirect(authUrl);
};
