"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { User } from "../types";

export async function getUser(userId: string): Promise<Result<User>> {
  try {
    const response = await apiClient.get<User>(`/users/${userId}`);

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
