"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Borrowing } from "../types";

export async function getBorrowing(
  groupId: string,
  id: string,
): Promise<Result<Borrowing>> {
  try {
    const response = await apiClient.get<Borrowing>(
      `/groups/${groupId}/borrowings/${id}`,
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
