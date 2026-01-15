"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import type { Result } from "@/utils";
import type { Repayment } from "../types";

export async function getRepayment(id: string): Promise<Result<Repayment>> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  // Fetch repayment data
  const { data: response, error } = await client.GET("/repayments/{id}", {
    params: { path: { id } },
  });

  if (error) {
    return {
      success: false,
      result: null,
      error: error.message,
    };
  }

  // Fetch user data in parallel
  const [payerResult, debtorResult] = await Promise.all([
    client.GET("/users/{id}", { params: { path: { id: response.payerId } } }),
    client.GET("/users/{id}", { params: { path: { id: response.debtorId } } }),
  ]);

  if (payerResult.error || debtorResult.error) {
    return {
      success: false,
      result: null,
      error: "Failed to fetch user data",
    };
  }

  // Transform to frontend Repayment type
  const repayment: Repayment = {
    id: response.id,
    payer: payerResult.data,
    debtor: debtorResult.data,
    amount: response.amount,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };

  return {
    success: true,
    result: repayment,
    error: null,
  };
}
