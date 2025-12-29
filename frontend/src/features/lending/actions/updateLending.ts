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
  const normalizedEventDate = normalizeEventDate(eventDate);

  try {
    await apiClient.put<Lending>(`/groups/${groupId}/lendings/${id}`, {
      name,
      amount,
      eventDate: normalizedEventDate,
      debts,
    });
    revalidatePath(`/groups/${groupId}/lendings/${id}/edit`);
    revalidatePath(`/groups/${groupId}/lendings/${id}`);
    revalidatePath(`/groups/${groupId}/lendings`);
    return submission.reply();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }
}

function normalizeEventDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString();
}
