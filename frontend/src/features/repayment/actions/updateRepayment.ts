"use server";

import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { updateRepaymentSchema } from "../schema";

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

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.PUT("/repayments/{id}", {
    params: { path: { id } },
    body: { amount },
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  revalidatePath(`/repayments/${id}/edit`);
  revalidatePath(`/repayments/${id}`);
  revalidatePath("/repayments");
  return submission.reply({ resetForm: true });
}
