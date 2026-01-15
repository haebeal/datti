"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils";
import type { User } from "../types";

type SearchUsersParams = {
  name?: string;
  email?: string;
  limit?: number;
};

export async function searchUsers(
  params?: SearchUsersParams,
): Promise<Result<User[]>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.GET("/users", {
    params: {
      query: {
        name: params?.name,
        email: params?.email,
        limit: params?.limit,
      },
    },
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
