"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { User } from "../types";

type GetMeResult =
  | { success: true; user: User }
  | { success: false; error: string };

/**
 * 自身のユーザー情報を取得
 */
export async function getMe(): Promise<GetMeResult> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.GET("/users/me");

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true, user: data };
}
