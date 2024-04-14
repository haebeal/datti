import { redirect } from "@remix-run/node";
import { oauth2Client } from "~/lib/oauthClient.server";

export const loader = () => redirect("/");

export const action = () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/userinfo.profile",
  });

  return redirect(authUrl);
};
