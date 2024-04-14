import axios from "axios";
import { OAuth2Client } from "google-auth-library";

export const oauth2Client = new OAuth2Client(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.VITE_GOOGLE_CLIENT_SECRET,
  `${process.env.VITE_CLIENT_URL}/api/auth/callback/google`
);

type FirebaseUser = {
  federatedId: string;
  providerId: string;
  localId: string;
  emailVerified: boolean;
  email: string;
  oauthIdToken: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  idToken: string;
  photoUrl: string;
  refreshToken: string;
  expiresIn: string;
  rawUserInfo: string;
};

type RefreshResponse = {
  expires_in: string;
  token_type: string;
  refresh_token: string;
  id_token: string;
  user_id: string;
  project_id: string;
};

export const signInFirebase = async (googleIdToken: string) => {
  const response = await axios.post<FirebaseUser>(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${process.env.VITE_FIREBASE_API_KEY}`,
    {
      requestUri: process.env.VITE_CLIENT_URL,
      tenantId: process.env.VITE_FIREBASE_TENANT_ID,
      postBody: `id_token=${googleIdToken}&providerId=google.com`,
      returnSecureToken: true,
      returnIdpCredential: false,
    }
  );
  return response.data;
};

export const refreshFirebaseIdToken = async (
  refreshToken: string
): Promise<RefreshResponse> => {
  const response = await axios.post<RefreshResponse>(
    `https://securetoken.googleapis.com/v1/token?key=${process.env.VITE_FIREBASE_API_KEY}`,
    {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data;
};
