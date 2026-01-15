"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils/types";
import type { Group } from "../types";
import type { User } from "@/features/user/types";

export async function getAllGroups(): Promise<Result<Group[]>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data: responses, error } = await client.GET("/groups");

  if (error) {
    return {
      success: false,
      result: null,
      error: error.message,
    };
  }

  // Extract unique creator IDs
  const creatorIds = new Set(responses.map((group) => group.createdBy));

  // Fetch all creators in parallel
  const creatorResults = await Promise.all(
    Array.from(creatorIds).map((userId) =>
      client.GET("/users/{id}", { params: { path: { id: userId } } }),
    ),
  );

  // Create creator map for O(1) lookup
  const creatorMap = new Map<string, User>();
  for (const result of creatorResults) {
    if (result.data) {
      creatorMap.set(result.data.id, result.data);
    }
  }

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
}
