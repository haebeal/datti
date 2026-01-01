"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Repayment } from "../types";

export async function getRepayment(id: string): Promise<Result<Repayment>> {
  try {
    const response = await apiClient.get<Repayment>(`/repayments/${id}`);
    return {
      success: true,
      result: response,
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
