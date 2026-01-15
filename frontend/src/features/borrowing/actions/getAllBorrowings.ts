"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Borrowing } from "../types";

export async function getAllBorrowings(
  groupId: string,
): Promise<Result<Borrowing[]>> {
  const token = await getAuthToken();

  try {
    const response = await apiClient.get<Borrowing[]>(
      `/groups/${groupId}/borrowings`,
      token,
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
