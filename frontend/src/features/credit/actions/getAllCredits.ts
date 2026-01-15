"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils";
import type { Credit } from "../types";
import type { User } from "@/features/user/types";

export async function getAllCredits(): Promise<Result<Credit[]>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  // Fetch all credits
  const { data: responses, error } = await client.GET("/credits");

  if (error) {
    return {
      success: false,
      result: null,
      error: error.message,
    };
  }

  // Extract unique user IDs
  const userIds = new Set(responses.map((credit) => credit.userId));

  // Fetch all users in parallel
  const userResults = await Promise.all(
    Array.from(userIds).map((userId) =>
      client.GET("/users/{id}", { params: { path: { id: userId } } }),
    ),
  );

  // Create user map for O(1) lookup
  const userMap = new Map<string, User>();
  for (const result of userResults) {
    if (result.data) {
      userMap.set(result.data.id, result.data);
    }
  }

  // Transform to frontend Credit type
  const credits: Credit[] = responses.map((response) => ({
    user: userMap.get(response.userId)!,
    amount: response.amount,
  }));

  return {
    success: true,
    result: credits,
    error: null,
  };
}
