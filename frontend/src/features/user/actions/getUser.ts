"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { User } from "../types";

export async function getUser(userId: string): Promise<Result<User>> {
  const token = await getAuthToken();

  try {
    const response = await apiClient.get<User>(`/users/${userId}`, token);

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
