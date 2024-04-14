/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_URL: string;
  readonly VITE_SESSION_SECRET: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_SECRET: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_TENANT_ID: string;
  readonly VITE_BACKEND_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
