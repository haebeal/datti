declare namespace NodeJS {
  interface ProcessEnv {
    // Cognito
    readonly COGNITO_DOMAIN: string;
    readonly COGNITO_CLIENT_ID: string;

    // アプリケーション設定
    readonly APP_URL: string;
    readonly API_URL: string;

    // Redis (Session Storage)
    readonly UPSTASH_REDIS_REST_URL: string;
    readonly UPSTASH_REDIS_REST_TOKEN: string;
  }
}
