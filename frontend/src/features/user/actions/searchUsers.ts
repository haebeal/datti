"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { User } from "../types";

type SearchUsersParams = {
  name?: string;
  email?: string;
  limit?: number;
};

export async function searchUsers(
  params?: SearchUsersParams,
): Promise<Result<User[]>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.name) searchParams.set("name", params.name);
    if (params?.email) searchParams.set("email", params.email);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const url = `/users${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiClient.get<User[]>(url);

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
