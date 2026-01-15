"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils";
import type { Group } from "../types";

export async function getGroup(id: string): Promise<Result<Group>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  // Fetch group data
  const { data: response, error } = await client.GET("/groups/{id}", {
    params: { path: { id } },
  });

  if (error) {
    return {
      success: false,
      result: null,
      error: error.message,
    };
  }

  // Fetch creator data
  const { data: creator, error: creatorError } = await client.GET(
    "/users/{id}",
    {
      params: { path: { id: response.createdBy } },
    },
  );

  if (creatorError) {
    return {
      success: false,
      result: null,
      error: creatorError.message,
    };
  }

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
}
