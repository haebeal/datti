"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { revalidatePath } from "next/cache";
import type { Subscription } from "../types";

type UpsertSubscriptionResult =
  | { success: true; subscription: Subscription }
  | { success: false; error: string };

/**
 * 通知購読を更新する
 */
export async function upsertSubscription(
  channel: "line",
  eventFiring: boolean,
  weeklySummary: boolean,
): Promise<UpsertSubscriptionResult> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.PUT(
    "/users/me/subscriptions/{channel}",
    {
      params: { path: { channel } },
      body: { eventFiring, weeklySummary },
    },
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  return { success: true, subscription: data };
}
