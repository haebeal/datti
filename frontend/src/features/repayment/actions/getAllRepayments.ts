"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Repayment } from "../types";

export async function getAllRepayments(): Promise<Result<Repayment[]>> {
  try {
    const response = await apiClient.get<Repayment[]>("/repayments");
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
