declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_BASE_URL: string;
    readonly NEXT_PUBLIC_BACKEND_URL: string;
    readonly NEXTAUTH_URL: string;
    readonly GOOGLE_CLIENT_ID: string;
    readonly GOOGLE_CLIENT_SECRET: string;

    readonly NEXT_PUBLIC_FIREBASE_API_KEY;
    readonly NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    readonly NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    readonly NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    readonly NEXT_PUBLIC_FIREBASE_MESSAGIN_SENDER_ID;
    readonly NEXT_PUBLIC_FIREBASE_APP_ID;
  }
}
