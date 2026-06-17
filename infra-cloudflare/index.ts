import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const accountId = config.require("accountId");
const zoneId = config.require("zoneId");

// R2: 静的アセット (アバター画像など) を配信する CDN バケット
const cdnBucket = new cloudflare.R2Bucket("cdn", {
    accountId: accountId,
    name: "datti-cdn",
    location: "apac",
});

// R2: SPA からの Presigned PUT を許可する CORS
new cloudflare.R2BucketCors("cdn-cors", {
    accountId: accountId,
    bucketName: cdnBucket.name,
    rules: [
        {
            allowed: {
                origins: ["https://datti.app", "http://localhost:3000"],
                methods: ["PUT", "GET"],
                headers: ["*"],
            },
            maxAgeSeconds: 3000,
        },
    ],
});

// R2: 公開 URL を cdn.datti.app にバインドする
new cloudflare.R2CustomDomain("cdn-domain", {
    accountId: accountId,
    bucketName: cdnBucket.name,
    domain: "cdn.datti.app",
    zoneId: zoneId,
    enabled: true,
});

// Pages: フロントエンド (datti) プロジェクト。
// 実デプロイは wrangler-action 経由なので build/source 設定は持たない。
const pagesProject = new cloudflare.PagesProject("frontend", {
    accountId: accountId,
    name: "datti",
    productionBranch: "main",
});

// Pages: datti.app をフロントの本番ドメインとしてバインド
new cloudflare.PagesDomain("frontend-domain", {
    accountId: accountId,
    projectName: pagesProject.name,
    name: "datti.app",
});

// Pages: OpenAPI (SwaggerUI) プロジェクト。
// 実デプロイは wrangler-action 経由なので build/source 設定は持たない。
const openapiProject = new cloudflare.PagesProject("openapi", {
    accountId: accountId,
    name: "datti-openapi",
    productionBranch: "main",
});

// Pages: openapi.datti.app を OpenAPI ドキュメントの本番ドメインとしてバインド
new cloudflare.PagesDomain("openapi-domain", {
    accountId: accountId,
    projectName: openapiProject.name,
    name: "openapi.datti.app",
});

export const cdnBucketName = cdnBucket.name;
export const pagesProjectName = pagesProject.name;
export const pagesProjectSubdomain = pagesProject.subdomain;
export const openapiProjectName = openapiProject.name;
export const openapiProjectSubdomain = openapiProject.subdomain;
