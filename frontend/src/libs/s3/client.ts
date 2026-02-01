import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.AWS_ENDPOINT_URL;

export const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? "ap-northeast-1",
  ...(endpoint && {
    endpoint,
    forcePathStyle: true,
  }),
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME ?? "";
