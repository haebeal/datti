"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Credit, CreditResponse } from "../types";
import type { User } from "@/features/user/types";

export async function getAllCredits(): Promise<Result<Credit[]>> {
  const token = await getAuthToken();

  try {
    // Fetch all credits
    const responses = await apiClient.get<CreditResponse[]>("/credits", token);

    // Extract unique user IDs
    const userIds = new Set(responses.map((credit) => credit.userId));

    // Fetch all users in parallel
    const users = await Promise.all(
      Array.from(userIds).map((userId) =>
        apiClient.get<User>(`/users/${userId}`, token),
      ),
    );

    // Create user map for O(1) lookup
    const userMap = new Map(users.map((user) => [user.id, user]));

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
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
