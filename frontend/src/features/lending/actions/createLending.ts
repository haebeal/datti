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

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.POST("/groups/{id}/lendings", {
    params: { path: { id: groupId } },
    body: {
      name,
      amount,
      eventDate: `${eventDate}T00:00:00+09:00`,
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
