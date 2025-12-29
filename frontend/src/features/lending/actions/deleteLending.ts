"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";

export async function deleteLending(
  groupId: string,
  lendingId: string,
): Promise<Result<void>> {
  try {
    await apiClient.delete(`/groups/${groupId}/lendings/${lendingId}`);
    return {
      success: true,
      result: undefined,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
