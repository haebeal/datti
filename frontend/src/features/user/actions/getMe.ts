"use server";

import { apiClient } from "@/libs/api/client";
import type { User } from "../types";

type GetMeResult =
  | { success: true; user: User }
  | { success: false; error: string };

/**
 * 自身のユーザー情報を取得
 */
export async function getMe(): Promise<GetMeResult> {
  try {
    const user = await apiClient.get<User>("/users/me");
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
