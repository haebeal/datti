"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { parseWithZod } from "@conform-to/zod";
import { addMemberSchema } from "../schema";
import { revalidatePath } from "next/cache";

export async function addMember(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: addMemberSchema,
  });
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { groupId, userId } = submission.value;

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.POST("/groups/{id}/members", {
    params: { path: { id: groupId } },
    body: { userId },
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  revalidatePath(`/groups/${groupId}/settings`);
  return submission.reply({ resetForm: true });
}
