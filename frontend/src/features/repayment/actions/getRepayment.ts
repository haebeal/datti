"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Repayment, RepaymentResponse } from "../types";
import type { User } from "@/features/user/types";

export async function getRepayment(id: string): Promise<Result<Repayment>> {
  const token = await getAuthToken();

  try {
    // Fetch repayment data
    const response = await apiClient.get<RepaymentResponse>(
      `/repayments/${id}`,
      token,
    );

    // Fetch user data in parallel
    const [payer, debtor] = await Promise.all([
      apiClient.get<User>(`/users/${response.payerId}`, token),
      apiClient.get<User>(`/users/${response.debtorId}`, token),
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
