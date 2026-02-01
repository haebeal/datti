declare namespace NodeJS {
  interface ProcessEnv {
    // Cognito
    readonly COGNITO_DOMAIN: string;
    readonly COGNITO_CLIENT_ID: string;

    // アプリケーション設定
    readonly APP_URL: string;
    readonly API_URL: string;

    // DynamoDB (Session Storage)
    readonly DYNAMODB_SESSIONS_TABLE: string;

    // S3 (Avatar)
    readonly S3_AVATAR_BUCKET: string;
    readonly AVATAR_BASE_URL: string;
  }
}
