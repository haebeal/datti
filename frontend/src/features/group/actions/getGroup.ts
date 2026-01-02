"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Group, GroupResponse } from "../types";
import type { User } from "@/features/user/types";

export async function getGroup(id: string): Promise<Result<Group>> {
  try {
    // Fetch group data
    const response = await apiClient.get<GroupResponse>(`/groups/${id}`);

    // Fetch creator data
    const creator = await apiClient.get<User>(`/users/${response.createdBy}`);

    // Transform to frontend Group type
    const group: Group = {
      id: response.id,
      name: response.name,
      creator,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };

    return {
      success: true,
      result: group,
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
