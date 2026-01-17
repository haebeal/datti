"use server";

import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.PUT("/groups/{id}/lendings/{lendingId}", {
    params: { path: { id: groupId, lendingId: id } },
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

  revalidatePath(`/groups/${groupId}/lendings/${id}/edit`);
  revalidatePath(`/groups/${groupId}/lendings/${id}`);
  revalidatePath(`/groups/${groupId}/lendings`);
  redirect(`/groups/${groupId}/lendings/${id}`);
}
