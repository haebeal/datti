import { Profile } from "@/features/profile";
import { DefaultSession } from "next-auth";

interface GoogleCredential {
  idToken?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiryAt?: number | null;
  error: string | null;
}

declare module "next-auth/jwt" {
  interface JWT {
    credential: GoogleCredential;
    profile: Profile;
  }
}

declare module "next-auth" {
  interface Session {
    credential: GoogleCredential;
  }
}
