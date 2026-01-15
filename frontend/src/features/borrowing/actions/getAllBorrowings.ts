"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils/types";
import type { Borrowing } from "../types";

export async function getAllBorrowings(
  groupId: string,
): Promise<Result<Borrowing[]>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.GET("/groups/{id}/borrowings", {
    params: { path: { id: groupId } },
  });

  if (error) {
    return {
      success: false,
      result: null,
      error: error.message,
    };
  }

  return {
    success: true,
    result: data.borrowings,
    error: null,
  };
}
