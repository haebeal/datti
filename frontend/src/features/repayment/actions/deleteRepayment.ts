"use server";

import { redirect } from "next/navigation";
import { apiClient } from "@/libs/api/client";

export type DeleteRepaymentState =
  | {
      error: string;
    }
  | undefined;

export async function deleteRepayment(
  id: string,
  _: DeleteRepaymentState,
  _formData: FormData,
): Promise<DeleteRepaymentState> {
  try {
    await apiClient.delete(`/repayments/${id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  redirect("/repayments");
}
