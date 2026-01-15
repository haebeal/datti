"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils";
import type { User } from "../types";

export async function getUser(userId: string): Promise<Result<User>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.GET("/users/{id}", {
    params: { path: { id: userId } },
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
