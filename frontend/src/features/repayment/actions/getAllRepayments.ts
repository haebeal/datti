"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Repayment, RepaymentResponse } from "../types";
import type { User } from "@/features/user/types";

export async function getAllRepayments(): Promise<Result<Repayment[]>> {
  try {
    // Fetch all repayments
    const responses = await apiClient.get<RepaymentResponse[]>("/repayments");

    // Extract unique user IDs
    const userIds = new Set<string>();
    responses.forEach((repayment) => {
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
    const repayments: Repayment[] = responses.map((response) => ({
      id: response.id,
      payer: userMap.get(response.payerId)!,
      debtor: userMap.get(response.debtorId)!,
      amount: response.amount,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    }));

    return {
      success: true,
      result: repayments,
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
