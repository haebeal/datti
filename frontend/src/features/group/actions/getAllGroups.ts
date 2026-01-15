"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Group, GroupResponse } from "../types";
import type { User } from "@/features/user/types";

export async function getAllGroups(): Promise<Result<Group[]>> {
  const token = await getAuthToken();

  try {
    // Fetch all groups
    const responses = await apiClient.get<GroupResponse[]>("/groups", token);

    // Extract unique creator IDs
    const creatorIds = new Set(responses.map((group) => group.createdBy));

    // Fetch all creators in parallel
    const creators = await Promise.all(
      Array.from(creatorIds).map((userId) =>
        apiClient.get<User>(`/users/${userId}`, token),
      ),
    );

    // Create creator map for O(1) lookup
    const creatorMap = new Map(creators.map((user) => [user.id, user]));

    // Transform to frontend Group type
    const groups: Group[] = responses.map((response) => ({
      id: response.id,
      name: response.name,
      creator: creatorMap.get(response.createdBy)!,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    }));

    return {
      success: true,
      result: groups,
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
