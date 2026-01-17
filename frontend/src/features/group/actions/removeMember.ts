"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { revalidatePath } from "next/cache";

export async function removeMember(groupId: string, userId: string) {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.DELETE("/groups/{id}/members/{userId}", {
    params: { path: { id: groupId, userId } },
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath(`/groups/${groupId}/settings`);
  return { success: true as const };
}
