"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { parseWithZod } from "@conform-to/zod";
import { updateGroupSchema } from "../schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateGroup(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: updateGroupSchema,
  });
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { id, name } = submission.value;

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.PUT("/groups/{id}", {
    params: { path: { id } },
    body: { name },
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  revalidatePath(`/groups/${id}/settings`);
  revalidatePath(`/groups/${id}`);
  revalidatePath("/groups");
  redirect(`/groups/${id}`);
}
