"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { apiClient } from "@/libs/api/client";
import { createRepaymentSchema } from "../schema";
import type { Repayment } from "../types";

export async function createRepayment(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createRepaymentSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { debtorId, amount } = submission.value;

  const token = await getAuthToken();

  let response: Repayment;

  try {
    response = await apiClient.post<Repayment>("/repayments", token, {
      debtorId,
      amount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }

  redirect(`/repayments/${response.id}`);
}
