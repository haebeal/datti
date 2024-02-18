declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_BASE_URL: string;
    readonly NEXT_PUBLIC_BACKEND_URL: string;
    readonly NEXTAUTH_URL: string;
    readonly GOOGLE_CLIENT_ID: string;
    readonly GOOGLE_CLIENT_SECRET: string;
    readonly FIREBASE_API_KEY: string;
    readonly FIREBASE_TENANT_ID: stirng;
  }
}
