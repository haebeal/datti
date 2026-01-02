"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Repayment, RepaymentResponse } from "../types";
import type { User } from "@/features/user/types";

export async function getRepayment(id: string): Promise<Result<Repayment>> {
  try {
    // Fetch repayment data
    const response = await apiClient.get<RepaymentResponse>(
      `/repayments/${id}`,
    );

    // Fetch user data in parallel
    const [payer, debtor] = await Promise.all([
      apiClient.get<User>(`/users/${response.payerId}`),
      apiClient.get<User>(`/users/${response.debtorId}`),
    ]);

    // Transform to frontend Repayment type
    const repayment: Repayment = {
      id: response.id,
      payer,
      debtor,
      amount: response.amount,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };

    return {
      success: true,
      result: repayment,
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
