"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils/types";
import type { Borrowing } from "../types";

export async function getBorrowing(
  groupId: string,
  id: string,
): Promise<Result<Borrowing>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.GET(
    "/groups/{id}/borrowings/{borrowingId}",
    {
      params: { path: { id: groupId, borrowingId: id } },
    },
  );

  if (error) {
    return {
      success: false,
      result: null,
      error: error.message,
    };
  }

  return {
    success: true,
    result: data,
    error: null,
  };
}
