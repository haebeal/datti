"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Repayment, PaginatedRepaymentResponse } from "../types";
import type { User } from "@/features/user/types";

type GetAllRepaymentsParams = {
  limit?: number;
  cursor?: string;
};

type PaginatedRepayments = {
  repayments: Repayment[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function getAllRepayments(
  params?: GetAllRepaymentsParams,
): Promise<Result<PaginatedRepayments>> {
  try {
    // Build query string
    const searchParams = new URLSearchParams();
    if (params?.limit) {
      searchParams.set("limit", params.limit.toString());
    }
    if (params?.cursor) {
      searchParams.set("cursor", params.cursor);
    }
    const query = searchParams.toString();
    const url = query ? `/repayments?${query}` : "/repayments";

    // Fetch repayments with pagination
    const data = await apiClient.get<PaginatedRepaymentResponse>(url);

    // Extract unique user IDs
    const userIds = new Set<string>();
    data.repayments.forEach((repayment) => {
      userIds.add(repayment.payerId);
      userIds.add(repayment.debtorId);
    });

    // Fetch all users in parallel
    const users = await Promise.all(
      Array.from(userIds).map((userId) =>
        apiClient.get<User>(`/users/${userId}`),
      ),
    );

    // Create user map for O(1) lookup
    const userMap = new Map(users.map((user) => [user.id, user]));

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
        nextCursor: data.nextCursor,
        hasMore: data.hasMore,
      },
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
