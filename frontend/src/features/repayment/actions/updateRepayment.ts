"use server";

import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { apiClient } from "@/libs/api/client";
import { updateRepaymentSchema } from "../schema";
import type { Repayment } from "../types";

export async function updateRepayment(
  id: string,
  _: unknown,
  formData: FormData,
) {
  const submission = parseWithZod(formData, {
    schema: updateRepaymentSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { amount } = submission.value;

  try {
    await apiClient.put<Repayment>(`/repayments/${id}`, {
      amount,
    });
    revalidatePath(`/repayments/${id}/edit`);
    revalidatePath(`/repayments/${id}`);
    revalidatePath("/repayments");
    return submission.reply({ resetForm: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }
}
