"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { createLendingSchema } from "../schema";

export async function createLending(
  groupId: string,
  _: unknown,
  formData: FormData,
) {
  const submission = parseWithZod(formData, {
    schema: createLendingSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name, amount, eventDate, debts } = submission.value;
  const normalizedEventDate = normalizeEventDate(eventDate);

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.POST("/groups/{id}/lendings", {
    params: { path: { id: groupId } },
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

  redirect(`/groups/${groupId}/lendings/${data.id}`);
}

function normalizeEventDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString();
}
