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
  }
}
