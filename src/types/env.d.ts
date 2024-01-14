declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_BASE_URL: string;
    readonly NEXT_PUBLIC_BACKEND_URL: string;
    readonly NEXT_PUBLIC_AUTH0_DOMAIN: string;
    readonly NEXT_PUBLIC_AUTH0_CLIENT_ID: string;
  }
}
