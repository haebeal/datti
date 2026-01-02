"use server";

import { apiClient } from "@/libs/api/client";
import { revalidatePath } from "next/cache";

export async function removeMember(groupId: string, userId: string) {
  try {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`);
    revalidatePath(`/groups/${groupId}/settings`);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false as const, error: message };
  }
}
