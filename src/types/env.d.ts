declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXTAUTH_SECRET: string;
    readonly GOOGLE_CLIENT_ID: string;
    readonly GOOGLE_CLIENT_SECRET: string;
    readonly NEXT_PUBLIC_FETCH_HOST: string;
    /* Auth0 */
    readonly NEXT_PUBLIC_BASE_URL: string;
    readonly NEXT_PUBLIC_AUTH0_DOMAIN: string;
    readonly NEXT_PUBLIC_AUTH0_CLIENT_ID: string;
  }
}
