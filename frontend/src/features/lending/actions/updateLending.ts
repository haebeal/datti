"use server";

import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { apiClient } from "@/libs/api/client";
import { updateLendingSchema } from "../schema";
import type { Lending } from "../types";

export async function updateLending(
  groupId: string,
  _: unknown,
  formData: FormData,
) {
  const submission = parseWithZod(formData, {
    schema: updateLendingSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { id, name, amount, eventDate, debts } = submission.value;

  try {
    await apiClient.put<Lending>(`/groups/${groupId}/lendings/${id}`, {
      name,
      amount,
      eventDate,
      debts,
    });
    revalidatePath(`/groups/${groupId}/lendings/${id}/edit`);
    revalidatePath(`/groups/${groupId}/lendings/${id}`);
    revalidatePath(`/groups/${groupId}/lendings`);
    return submission.reply({ resetForm: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }
}
