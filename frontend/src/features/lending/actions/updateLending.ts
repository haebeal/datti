"use server";

import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { updateLendingSchema } from "../schema";

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

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.PUT("/groups/{id}/lendings/{lendingId}", {
    params: { path: { id: groupId, lendingId: id } },
    body: {
      name,
      amount,
      eventDate: normalizedEventDate,
      debts,
    },
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  revalidatePath(`/groups/${groupId}/lendings/${id}/edit`);
  revalidatePath(`/groups/${groupId}/lendings/${id}`);
  revalidatePath(`/groups/${groupId}/lendings`);
  return submission.reply();
}

function normalizeEventDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString();
}
