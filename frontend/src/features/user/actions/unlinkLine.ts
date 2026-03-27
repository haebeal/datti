"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { revalidatePath } from "next/cache";

type UnlinkLineResult =
  | { success: true }
  | { success: false; error: string };

/**
 * LINE連携を解除する
 */
export async function unlinkLine(): Promise<UnlinkLineResult> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.DELETE("/users/me/line");

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}
