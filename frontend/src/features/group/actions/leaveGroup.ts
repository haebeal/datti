"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { getMe } from "@/features/user/actions/getMe";

export async function leaveGroup(groupId: string) {
  const token = await getAuthToken();
  const client = createApiClient(token);

  // 現在のユーザーIDを取得
  const meResult = await getMe();
  if (!meResult.success) {
    return { success: false as const, error: meResult.error };
  }

  const { error } = await client.DELETE("/groups/{id}/members/{userId}", {
    params: { path: { id: groupId, userId: meResult.user.id } },
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/groups", "layout");
  redirect("/groups");
}
