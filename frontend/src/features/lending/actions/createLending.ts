"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
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

  let response: Lending;

  try {
    response = await apiClient.post<Lending>(
      `/groups/${groupId}/lendings`,
      {
        name,
        amount,
        eventDate,
        debts,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }

  // redirect は try ブロックの外で呼ぶ
  redirect(`/groups/${groupId}/lendings/${response.id}`);
}
