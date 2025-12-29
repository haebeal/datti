"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { GroupMember } from "../types";

export async function getMembers(
  groupId: string,
): Promise<Result<GroupMember[]>> {
  try {
    const response = await apiClient.get<GroupMember[]>(
      `/groups/${groupId}/members`,
    );
    return {
      success: true,
      result: response,
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
