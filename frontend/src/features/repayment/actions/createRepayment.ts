"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { createRepaymentSchema } from "../schema";

export async function createRepayment(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createRepaymentSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { debtorId, amount } = submission.value;

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.POST("/repayments", {
    body: { debtorId, amount },
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  redirect(`/repayments/${data.id}`);
}
