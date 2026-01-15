"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { apiClient } from "@/libs/api/client";
import { createLendingSchema } from "../schema";
import type { Lending } from "../types";

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

  let response: Lending;

  try {
    response = await apiClient.post<Lending>(
      `/groups/${groupId}/lendings`,
      token,
      {
        name,
        amount,
        eventDate: normalizedEventDate,
        debts,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }

  redirect(`/groups/${groupId}/lendings/${response.id}`);
}

function normalizeEventDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString();
}
