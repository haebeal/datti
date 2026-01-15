"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Group, GroupResponse } from "../types";
import type { User } from "@/features/user/types";

export async function getGroup(id: string): Promise<Result<Group>> {
  const token = await getAuthToken();

  try {
    // Fetch group data
    const response = await apiClient.get<GroupResponse>(`/groups/${id}`, token);

    // Fetch creator data
    const creator = await apiClient.get<User>(`/users/${response.createdBy}`, token);

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
