"use server";

import { redirect } from "next/navigation";
import { getAuthToken } from "@/libs/auth/getAuthToken";
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
  const token = await getAuthToken();

  try {
    await apiClient.delete(`/repayments/${id}`, token);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  redirect("/repayments");
}
