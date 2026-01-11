declare namespace NodeJS {
  interface ProcessEnv {
    // Google OAuth認証
    readonly GOOGLE_CLIENT_ID: string;
    readonly GOOGLE_CLIENT_SECRET: string;

    // アプリケーション設定
    readonly APP_URL: string;
    readonly API_URL: string;

    // Firebase認証
    readonly FIREBASE_API_KEY: string;

    // Redis (Session Storage)
    readonly UPSTASH_REDIS_REST_URL: string;
    readonly UPSTASH_REDIS_REST_TOKEN: string;
  }
}
