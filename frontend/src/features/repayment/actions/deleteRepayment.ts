"use server";

import { redirect } from "next/navigation";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";

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
  const client = createApiClient(token);

  const { error } = await client.DELETE("/repayments/{id}", {
    params: { path: { id } },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/repayments");
}
