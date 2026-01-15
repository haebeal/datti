"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils/types";
import type { Repayment, PaginatedRepayments } from "../types";
import type { User } from "@/features/user/types";

type GetAllRepaymentsParams = {
  limit?: number;
  cursor?: string;
};

export async function getAllRepayments(
  params?: GetAllRepaymentsParams,
): Promise<Result<PaginatedRepayments>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  // Fetch repayments with pagination
  const { data, error } = await client.GET("/repayments", {
    params: {
      query: {
        limit: params?.limit,
        cursor: params?.cursor,
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

  // Extract unique user IDs
  const userIds = new Set<string>();
  for (const repayment of data.repayments) {
    userIds.add(repayment.payerId);
    userIds.add(repayment.debtorId);
  }

  // Fetch all users in parallel
  const userResults = await Promise.all(
    Array.from(userIds).map((userId) =>
      client.GET("/users/{id}", { params: { path: { id: userId } } }),
    ),
  );

  // Create user map for O(1) lookup
  const userMap = new Map<string, User>();
  for (const result of userResults) {
    if (result.data) {
      userMap.set(result.data.id, result.data);
    }
  }

  // Transform to frontend Repayment type
  const repayments: Repayment[] = data.repayments.map((response) => ({
    id: response.id,
    payer: userMap.get(response.payerId)!,
    debtor: userMap.get(response.debtorId)!,
    amount: response.amount,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  }));

  return {
    success: true,
    result: {
      repayments,
      nextCursor: data.nextCursor ?? null,
      hasMore: data.hasMore,
    },
    error: null,
  };
}
