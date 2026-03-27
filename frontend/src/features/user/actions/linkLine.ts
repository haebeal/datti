"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { revalidatePath } from "next/cache";

type LinkLineResult =
  | { success: true }
  | { success: false; error: string };

/**
 * LINE認可コードでアカウントを紐づける
 */
export async function linkLine(
  code: string,
  redirectUri: string,
): Promise<LinkLineResult> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.PUT("/users/me/line", {
    body: { code, redirectUri },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}
