import {
  AppLoadContext,
  SessionStorage,
  createCookieSessionStorage,
} from "@remix-run/cloudflare";

type AuthSessionData = {
  idToken: string;
  refreshToken: string;
  expiresDateTime: string;
};

let _authSession: SessionStorage<AuthSessionData> | undefined;

export const getAuthSessionStorage = (context: AppLoadContext) => {
  if (!_authSession) {
    _authSession = createCookieSessionStorage<AuthSessionData>({
      cookie: {
        name: "auth_session",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secrets: [context.cloudflare.env.SESSION_SECRET],
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
      },
    });
  }

  return _authSession;
};
