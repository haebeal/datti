"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Lending } from "../types";

export async function getLending(
  groupId: string,
  id: string,
): Promise<Result<Lending>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.GET("/groups/{id}/lendings/{lendingId}", {
    params: { path: { id: groupId, lendingId: id } },
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
    result: data,
    error: null,
  };
}
