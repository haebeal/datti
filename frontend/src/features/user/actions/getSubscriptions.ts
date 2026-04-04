"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Subscription } from "../types";

type GetSubscriptionsResult =
  | { success: true; subscriptions: Subscription[] }
  | { success: false; error: string };

/**
 * 通知購読一覧を取得する
 */
export async function getSubscriptions(): Promise<GetSubscriptionsResult> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.GET("/users/me/subscriptions");

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, subscriptions: data ?? [] };
}
