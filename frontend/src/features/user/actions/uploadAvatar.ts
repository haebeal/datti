"use server";

import { cookies } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "@/libs/s3/client";
import { getSession } from "@/libs/session/session";

type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadAvatar(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null;

  if (!file) {
    return { success: false, error: "ファイルが選択されていません" };
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) {
    return { success: false, error: "認証が必要です" };
  }

  const session = await getSession(sessionId);
  if (!session) {
    return { success: false, error: "セッションが無効です" };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { success: false, error: "ファイルサイズは10MB以下にしてください" };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "JPG、PNG、WebP形式のみアップロード可能です",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileId = crypto.randomUUID();
    const extension = file.type === "image/webp" ? "webp" : "webp";
    const key = `avatars/${fileId}.${extension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: "image/webp",
      }),
    );

    const endpoint = process.env.AWS_ENDPOINT_URL;
    const url = endpoint
      ? `${endpoint}/${S3_BUCKET_NAME}/${key}`
      : `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { success: true, url };
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    return { success: false, error: "アップロードに失敗しました" };
  }
}
