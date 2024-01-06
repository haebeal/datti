import { HttpError } from "@/errors";
import { getProfile, postProfile } from "@/features/profile";
import { google } from "googleapis";
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `http://${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
);

const refreshoken = async (token: JWT): Promise<JWT> => {
  oauth2Client.setCredentials({
    refresh_token: token.credential.refreshToken,
  });
  const {
    credentials: { id_token, access_token, refresh_token, expiry_date },
  } = await oauth2Client.refreshAccessToken();

  if (!id_token || !access_token || !refresh_token || !expiry_date) {
    token.credential.error = "OAuth Error";
  } else {
    token.credential.error = null;
  }

  token.credential.idToken = id_token;
  token.credential.accessToken = access_token;
  token.credential.expiryAt = expiry_date;
  token.credential.refreshToken = refresh_token;

  return token;
};

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
    error: "/401",
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (account?.access_token) {
        return {
          credential: {
            idToken: account.id_token,
            accessToken: account.access_token,
            expiryAt: account.expires_at,
            refreshToken: account.refresh_token,
            error: null,
          },
          user,
        };
      }
      if (!token.credential.expiryAt) {
        throw new Error("トークンの有効期限が取得できませんでした");
      }
      if (new Date() > new Date(token.credential.expiryAt + 100)) {
        return refreshoken(token);
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.credential = token.credential;
      if (token.credential.accessToken) {
        const profile = await getProfile(token.credential.accessToken);
        session.profile = profile;
      }
      return session;
    },
    signIn: async ({ user, account }) => {
      const accessToken = account?.access_token;
      if (!accessToken) {
        return false;
      }
      try {
        await getProfile(accessToken);
      } catch (error) {
        if (!(error instanceof HttpError) || error.status !== 404) {
          return false;
        }
        // Profile が取得できなかった場合は作成
        const { name, email, image } = user;
        if (name === null || email === null || image === null) {
          return false;
        }
        try {
          await postProfile(accessToken, {
            name,
            email,
            photoUrl: image,
          });
        } catch (error) {
          return false;
        }
      }
      return true;
    },
  },
});
