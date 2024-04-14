import { createCookieSessionStorage } from "@remix-run/node";

const sessionSecret = process.env.VITE_SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRETを設定してください。");
}

type AuthSessionData = {
  idToken: string;
  refreshToken: string;
  expiresDateTime: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<AuthSessionData>({
    cookie: {
      name: "auth_session",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [sessionSecret],
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    },
  });

export { commitSession, destroySession, getSession };
