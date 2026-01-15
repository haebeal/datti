"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils/types";
import type { GroupMember } from "../types";

export async function getMembers(
  groupId: string,
): Promise<Result<GroupMember[]>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.GET("/groups/{id}/members", {
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
    result: data,
    error: null,
  };
}
