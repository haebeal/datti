import axios from "axios";
import { google } from "googleapis";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

import type { AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

import { createDattiClient } from "@/utils";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
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

const getFirebaseIdToken = async (googleIdToken: string) => {
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${process.env.FIREBASE_API_KEY}`,
    {
      requestUri: "http://localhost:3000",
      tenantId: process.env.FIREBASE_TENANT_ID,
      postBody: `id_token=${googleIdToken}&providerId=google.com`,
      returnSecureToken: true,
      returnIdpCredential: false,
    }
  );
  return response.data.idToken as string;
};

export const authOptions: AuthOptions = {
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
      const googleIdToken = token.credential.idToken;
      if (!googleIdToken) {
        throw new Error("Google IDToken の取得に失敗しました");
      }
      const idToken = await getFirebaseIdToken(googleIdToken);
      session.idToken = idToken;
      session.user = await createDattiClient(idToken).me.$get();
      return session;
    },
  },
};

export default NextAuth(authOptions);
